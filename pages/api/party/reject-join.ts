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

  const { requesterUid } = req.body;

  if (!requesterUid) {
    return res.status(400).json({ error: "Missing requesterUid" });
  }

  try {
    // 1. Authenticate (Leader)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const leaderUid = decodedToken.uid;

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const parties = db.collection("parties");

    // 3. Get Leader's Party
    const leader = await users.findOne({ _id: leaderUid });
    if (!leader || !leader.partyId) {
      return res.status(400).json({ error: "You are not in a party" });
    }

    const partyId = leader.partyId;
    const party = await parties.findOne({ _id: new ObjectId(partyId) });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    if (party.leaderUid !== leaderUid) {
      return res
        .status(403)
        .json({ error: "Only the leader can reject join requests" });
    }

    // 4. Remove Request
    const result = await parties.updateOne(
      { _id: new ObjectId(partyId) },
      { $pull: { joinRequests: { uid: requesterUid } } as any }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "Request not found or already removed" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Join request rejected" });
  } catch (error) {
    console.error("[Party Reject Join] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
