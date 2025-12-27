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
    const senderUid = decodedToken.uid;

    // 2. Validate Input
    const { targetUsername } = req.body;
    if (!targetUsername) {
      return res.status(400).json({ error: "Missing targetUsername" });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Fetch Sender and Target
    const sender = await users.findOne({ _id: senderUid });
    if (!sender)
      return res.status(404).json({ error: "Sender profile not found" });

    if (!sender.username) {
      return res.status(400).json({ error: "You must set a username first" });
    }

    // Case insensitive search for target
    const target = await users.findOne({
      username: { $regex: new RegExp(`^${targetUsername}$`, "i") },
    });

    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    if (target._id === senderUid) {
      return res
        .status(400)
        .json({ error: "Cannot send friend request to yourself" });
    }

    // Check Block Status
    const isBlockedByMe = sender.blocked?.some(
      (b: any) => b.uid === target._id
    );
    if (isBlockedByMe) {
      return res.status(400).json({ error: "You have blocked this user" });
    }

    const isBlockedByTarget = target.blocked?.some(
      (b: any) => b.uid === senderUid
    );
    if (isBlockedByTarget) {
      return res.status(400).json({ error: "You cannot add this user" });
    }

    // 4. Check existing relationship
    // Check if already friends
    const isFriend = sender.friends?.some((f: any) => f.uid === target._id);
    if (isFriend) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Check if request already pending (incoming or outgoing)
    const existingRequest = sender.friendRequests?.some(
      (r: any) => r.uid === target._id
    );
    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already pending" });
    }

    // 5. Execute Updates
    const now = new Date();

    // Add outgoing request to sender
    await users.updateOne(
      { _id: senderUid },
      {
        $push: {
          friendRequests: {
            uid: target._id,
            username: target.username,
            type: "outgoing",
            createdAt: now,
          },
        } as any,
      }
    );

    // Add incoming request to target
    await users.updateOne(
      { _id: target._id },
      {
        $push: {
          friendRequests: {
            uid: senderUid,
            username: sender.username,
            type: "incoming",
            createdAt: now,
          },
        } as any,
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Friend request sent" });
  } catch (error: any) {
    console.error("[Friend Request] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
