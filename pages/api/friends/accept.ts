import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const currentUserUid = decodedToken.uid;

    // 2. Validate Input
    const { requesterUid } = req.body;
    if (!requesterUid) {
      return res.status(400).json({ error: "Missing requesterUid" });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Fetch Current User
    const currentUser = await users.findOne({ _id: currentUserUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // 4. Verify Request Exists
    const hasRequest = currentUser.friendRequests?.some(
      (r: any) => r.uid === requesterUid && r.type === "incoming"
    );

    if (!hasRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // 5. Fetch Requester (to get latest username)
    const requester = await users.findOne({ _id: requesterUid });
    if (!requester)
      return res.status(404).json({ error: "Requester not found" });

    const now = new Date();

    // 6. Execute Updates (Atomic-ish)

    // Update Current User: Remove request, Add friend
    await users.updateOne(
      { _id: currentUserUid },
      {
        $pull: { friendRequests: { uid: requesterUid } },
        $push: {
          friends: {
            uid: requesterUid,
            username: requester.username,
            addedAt: now,
          },
        } as any,
      }
    );

    // Update Requester: Remove request, Add friend
    await users.updateOne(
      { _id: requesterUid },
      {
        $pull: { friendRequests: { uid: currentUserUid } },
        $push: {
          friends: {
            uid: currentUserUid,
            username: currentUser.username,
            addedAt: now,
          },
        } as any,
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Friend request accepted" });
  } catch (error: any) {
    console.error("[Friend Accept] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
