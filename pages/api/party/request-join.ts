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

  const { targetUsername, partyId, targetUid } = req.body;

  if (!targetUsername && !partyId && !targetUid) {
    return res
      .status(400)
      .json({ error: "Must provide targetUsername, targetUid, or partyId" });
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

    // 3. Get Current User (Sender)
    const currentUser = await users.findOne({ _id: uid });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Determine Target Party ID
    let targetPartyId: ObjectId;

    if (partyId) {
      targetPartyId = new ObjectId(partyId);
    } else if (targetUid) {
      const targetUser = await users.findOne({ _id: targetUid });
      if (!targetUser) {
        return res.status(404).json({ error: "Target user not found" });
      }
      if (!targetUser.partyId) {
        return res.status(400).json({ error: "Target user is not in a party" });
      }
      targetPartyId = new ObjectId(targetUser.partyId);
    } else {
      // Find by username
      const targetUser = await users.findOne({ username: targetUsername });
      if (!targetUser) {
        return res.status(404).json({ error: "Target user not found" });
      }
      if (!targetUser.partyId) {
        return res.status(400).json({ error: "Target user is not in a party" });
      }
      targetPartyId = new ObjectId(targetUser.partyId);
    }

    // 5. Fetch Party
    const party = await parties.findOne({ _id: targetPartyId });
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // 6. Validations
    if (party.members.some((m: any) => m.uid === uid)) {
      return res.status(400).json({ error: "You are already in this party" });
    }

    if (party.members.length >= 5) {
      return res.status(400).json({ error: "Party is full" });
    }

    // Check if already requested
    const existingRequest = party.joinRequests?.find((r: any) => r.uid === uid);
    if (existingRequest) {
      return res.status(400).json({ error: "Request already pending" });
    }

    // Check Block Status (Optional but recommended)
    // (Skipping for brevity, but ideally check if leader blocked sender)

    // 7. Add Join Request
    const request = {
      uid: currentUser._id,
      username: currentUser.username,
      avatarId: currentUser.avatarId || "Alpha",
      requestedAt: new Date(),
    };

    await parties.updateOne(
      { _id: targetPartyId },
      { $push: { joinRequests: request } as any }
    );

    return res.status(200).json({ success: true, message: "Request sent" });
  } catch (error) {
    console.error("[Party Request Join] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
