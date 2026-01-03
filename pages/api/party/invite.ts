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
    const { targetUsername } = req.body;
    if (!targetUsername) {
      return res.status(400).json({ error: "Target username is required" });
    }

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

    // 3. Get Current User & Party
    const currentUser = await users.findOne({ _id: uid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    if (!currentUser.partyId) {
      return res.status(400).json({ error: "You are not in a party" });
    }

    const party = await parties.findOne({
      _id: new ObjectId(currentUser.partyId),
    });
    if (!party) {
      // Inconsistency fix
      await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });
      return res.status(404).json({ error: "Party not found" });
    }

    if (party.leaderUid !== uid) {
      return res
        .status(403)
        .json({ error: "Only the party leader can invite" });
    }

    if (party.members.length >= 5) {
      return res.status(400).json({ error: "Party is full (max 5 members)" });
    }

    // 4. Find Target User
    const targetUser = await users.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser._id === uid) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }

    // Check if user is already in the party
    const isAlreadyMember = party.members.some(
      (m: any) => m.uid === targetUser._id
    );
    if (isAlreadyMember) {
      return res.status(400).json({ error: "User is already in the party" });
    }

    // Check Block Status
    const isBlockedByMe = currentUser.blocked?.some(
      (b: any) => b.uid === targetUser._id
    );
    if (isBlockedByMe) {
      return res.status(400).json({ error: "You have blocked this user" });
    }

    const isBlockedByTarget = targetUser.blocked?.some(
      (b: any) => b.uid === uid
    );
    if (isBlockedByTarget) {
      return res.status(400).json({ error: "You cannot invite this user" });
    }

    // Allow inviting users who are already in a party (they will auto-leave when joining)
    // if (targetUser.partyId) {
    //   return res.status(400).json({ error: "User is already in a party" });
    // }

    // Check if already invited
    const existingInvite = targetUser.partyInvites?.find(
      (inv: any) => inv.partyId.toString() === party._id.toString()
    );
    if (existingInvite) {
      return res.status(400).json({ error: "User already invited" });
    }

    // 5. Send Invite (Update Target User)
    const invite = {
      partyId: party._id,
      leaderUid: currentUser._id,
      leaderUsername: currentUser.username,
      invitedAt: new Date(),
    };

    await users.updateOne(
      { _id: targetUser._id },
      { $push: { partyInvites: invite } as any }
    );

    return res.status(200).json({ message: `Invited ${targetUsername}` });
  } catch (error: any) {
    console.error("[Party Invite] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
