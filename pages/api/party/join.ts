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
    const { partyId } = req.body;
    if (!partyId) {
      return res.status(400).json({ error: "Party ID is required" });
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

    // 3. Check User Status
    const user = await users.findOne({ _id: uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.partyId) {
      return res.status(400).json({ error: "You are already in a party" });
    }

    // 4. Check Party Existence & Privacy
    const party = await parties.findOne({ _id: new ObjectId(partyId) });
    if (!party) {
      // Clean up stale invite if it existed
      await users.updateOne(
        { _id: uid },
        { $pull: { partyInvites: { partyId: new ObjectId(partyId) } } as any }
      );
      return res.status(404).json({ error: "Party no longer exists" });
    }

    // 5. Verify Access (Invite OR Public)
    // Check Block Status (Safety Check)
    const leader = await users.findOne({ _id: party.leaderUid });
    if (leader) {
      const isBlockedByLeader = leader.blocked?.some((b: any) => b.uid === uid);
      if (isBlockedByLeader) {
        return res
          .status(403)
          .json({ error: "You are blocked by the party leader" });
      }
    }

    const isLeaderBlockedByMe = user.blocked?.some(
      (b: any) => b.uid === party.leaderUid
    );
    if (isLeaderBlockedByMe) {
      return res
        .status(403)
        .json({ error: "You have blocked the party leader" });
    }

    const isPublic = party.privacy === "public";
    const hasInvite = user.partyInvites?.some(
      (inv: any) => inv.partyId.toString() === partyId
    );

    if (!isPublic && !hasInvite) {
      return res
        .status(403)
        .json({ error: "This party is private. You need an invite." });
    }

    // Check Party Size Limit
    if (party.members.length >= 5) {
      return res.status(400).json({ error: "Party is full (max 5 members)" });
    }

    // 6. Join Party (Atomic Update)
    // Add to party members
    await parties.updateOne(
      { _id: new ObjectId(partyId) },
      {
        $push: {
          members: {
            uid: uid,
            username: user.username,
            joinedAt: new Date(),
          },
        } as any,
      }
    );

    // Update User: Set partyId, Remove Invite
    await users.updateOne(
      { _id: uid },
      {
        $set: { partyId: new ObjectId(partyId) },
        $pull: { partyInvites: { partyId: new ObjectId(partyId) } } as any,
      }
    );

    return res.status(200).json({ message: "Joined party", partyId });
  } catch (error: any) {
    console.error("[Party Join] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
