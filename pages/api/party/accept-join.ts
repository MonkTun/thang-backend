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
        .json({ error: "Only the leader can accept join requests" });
    }

    // 4. Verify Request Exists
    const request = party.joinRequests?.find(
      (r: any) => r.uid === requesterUid
    );
    if (!request) {
      return res.status(404).json({ error: "Join request not found" });
    }

    if (party.members.length >= 5) {
      return res.status(400).json({ error: "Party is full" });
    }

    // 5. Handle Requester's Old Party (Auto-Leave)
    const requester = await users.findOne({ _id: requesterUid });
    if (requester && requester.partyId) {
      const oldPartyId = requester.partyId;
      // If they are somehow already in this party (race condition), just remove request
      if (oldPartyId.toString() === partyId.toString()) {
        await parties.updateOne(
          { _id: new ObjectId(partyId) },
          { $pull: { joinRequests: { uid: requesterUid } } as any }
        );
        return res.status(200).json({ message: "User already in party" });
      }

      // Remove from old party
      const oldParty = await parties.findOne({ _id: new ObjectId(oldPartyId) });
      if (oldParty) {
        const updatedMembers = oldParty.members.filter(
          (m: any) => m.uid !== requesterUid
        );

        // If old party becomes empty, delete it
        if (updatedMembers.length === 0) {
          await parties.deleteOne({ _id: new ObjectId(oldPartyId) });
        } else {
          // If requester was leader, assign new leader
          let newLeaderUid = oldParty.leaderUid;
          if (oldParty.leaderUid === requesterUid) {
            newLeaderUid = updatedMembers[0].uid;
          }
          await parties.updateOne(
            { _id: new ObjectId(oldPartyId) },
            { $set: { members: updatedMembers, leaderUid: newLeaderUid } }
          );
        }
      }
    }

    // 6. Add to New Party
    const newMember = {
      uid: requesterUid,
      username: requester?.username || "Unknown",
      joinedAt: new Date(),
      isReady: false,
    };

    await parties.updateOne(
      { _id: new ObjectId(partyId) },
      {
        $push: { members: newMember } as any,
        $pull: { joinRequests: { uid: requesterUid } } as any,
      }
    );

    // 7. Update Requester's User Doc
    await users.updateOne(
      { _id: requesterUid },
      { $set: { partyId: partyId } }
    );

    return res
      .status(200)
      .json({ success: true, message: "User added to party" });
  } catch (error) {
    console.error("[Party Accept Join] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
