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

    const { targetUid } = req.body;
    if (!targetUid) {
      return res.status(400).json({ error: "Target UID is required" });
    }

    if (targetUid === uid) {
      return res.status(400).json({ error: "You cannot kick yourself" });
    }

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const parties = db.collection("parties");

    // 3. Get User & Party
    const user = await users.findOne({ _id: uid });
    if (!user || !user.partyId) {
      return res.status(400).json({ error: "You are not in a party" });
    }

    const partyId = user.partyId;
    const party = await parties.findOne({ _id: new ObjectId(partyId) });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // 4. Verify Leadership
    if (party.leaderUid !== uid) {
      return res
        .status(403)
        .json({ error: "Only the leader can kick members" });
    }

    // 5. Verify Target is in Party
    const isTargetInParty = party.members.some((m: any) => m.uid === targetUid);
    if (!isTargetInParty) {
      return res.status(400).json({ error: "Target user is not in the party" });
    }

    // 6. Kick User
    // Remove from party members
    await parties.updateOne(
      { _id: new ObjectId(partyId) },
      { $pull: { members: { uid: targetUid } } as any }
    );

    // Create new solo party for kicked user
    const targetUser = await users.findOne({ _id: targetUid });
    const newParty = {
      leaderUid: targetUid,
      region: party.region || "US-East",
      members: [
        {
          uid: targetUid,
          username: targetUser?.username || "Unknown",
          joinedAt: new Date(),
          isReady: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await parties.insertOne(newParty);

    // Update kicked user with new partyId
    await users.updateOne(
      { _id: targetUid },
      { $set: { partyId: result.insertedId.toString() } }
    );

    return res.status(200).json({ message: "User kicked from party" });
  } catch (error: any) {
    console.error("[Party Kick] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
