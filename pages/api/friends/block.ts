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
    const uid = decodedToken.uid;

    const { targetUid } = req.body;
    if (!targetUid) {
      return res.status(400).json({ error: "Target UID is required" });
    }

    if (targetUid === uid) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Block User
    // Add to blocked list
    await users.updateOne(
      { _id: uid },
      {
        $addToSet: {
          blocked: {
            uid: targetUid,
            blockedAt: new Date(),
          },
        } as any,
      }
    );

    // 4. Clean up relationships
    // Remove from friends (both sides)
    await users.updateOne(
      { _id: uid },
      { $pull: { friends: { uid: targetUid } } as any }
    );
    await users.updateOne(
      { _id: targetUid },
      { $pull: { friends: { uid: uid } } as any }
    );

    // Remove any pending requests (both sides)
    await users.updateOne(
      { _id: uid },
      { $pull: { friendRequests: { uid: targetUid } } as any }
    );
    await users.updateOne(
      { _id: targetUid },
      { $pull: { friendRequests: { uid: uid } } as any }
    );

    return res.status(200).json({ message: "User blocked" });
  } catch (error: any) {
    console.error("[Friend Block] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
