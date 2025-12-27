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

    const { requesterUid } = req.body;
    if (!requesterUid) {
      return res.status(400).json({ error: "Requester UID is required" });
    }

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Remove Requests (Both Sides)
    // Remove incoming request from current user
    await users.updateOne(
      { _id: uid },
      {
        $pull: {
          friendRequests: { uid: requesterUid, type: "incoming" },
        } as any,
      }
    );

    // Remove outgoing request from requester
    await users.updateOne(
      { _id: requesterUid },
      { $pull: { friendRequests: { uid: uid, type: "outgoing" } } as any }
    );

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error: any) {
    console.error("[Friend Reject] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
