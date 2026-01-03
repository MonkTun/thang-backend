import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { partyId } = req.body;

  if (!partyId || typeof partyId !== "string") {
    return res.status(400).json({ error: "Missing partyId" });
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

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Remove Invite
    const result = await users.updateOne(
      { _id: uid },
      {
        $pull: {
          partyInvites: { partyId: new ObjectId(partyId) },
        } as any,
      }
    );

    if (result.modifiedCount === 0) {
      // It's possible the invite didn't exist, but we can consider this a success (idempotent)
      // or return 404 if strict. For UI responsiveness, success is usually better.
      // However, let's check if the user exists at least.
      const user = await users.findOne({ _id: uid });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    }

    return res.status(200).json({ success: true, message: "Invite declined" });
  } catch (error) {
    console.error("[Party Decline] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
