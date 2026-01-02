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
    const parties = db.collection("parties");

    // 3. Check if user is already in a party
    const user = await users.findOne({ _id: uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.partyId) {
      return res.status(400).json({ error: "You are already in a party" });
    }

    const { region } = req.body;

    // 4. Create Party
    const newParty = {
      leaderUid: uid,
      region: region || "US-East", // Default region
      members: [
        {
          uid: uid,
          username: user.username || "Unknown",
          joinedAt: new Date(),
          isReady: true, // Leader is always ready? Or false? Let's say false or true. Usually leader starts so ready doesn't matter as much, but let's default false.
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await parties.insertOne(newParty);
    const partyId = result.insertedId;

    // 5. Update User
    await users.updateOne({ _id: uid }, { $set: { partyId: partyId } });

    return res.status(200).json({
      message: "Party created",
      partyId: partyId,
      party: newParty,
    });
  } catch (error: any) {
    console.error("[Party Create] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
