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

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const uid = decodedToken.uid;

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const parties = db.collection("parties");

    // 3. Check Party & Leave Logic
    const user = await users.findOne({ _id: uid });

    if (user && user.partyId) {
      const partyId = user.partyId;
      const party = await parties.findOne({ _id: new ObjectId(partyId) });

      if (party) {
        const updatedMembers = party.members.filter((m: any) => m.uid !== uid);

        if (updatedMembers.length === 0) {
          // Party empty -> Delete
          await parties.deleteOne({ _id: new ObjectId(partyId) });
        } else {
          // Party not empty -> Update members
          let newLeaderUid = party.leaderUid;
          if (party.leaderUid === uid) {
            // Promote next member
            newLeaderUid = updatedMembers[0].uid;
          }

          await parties.updateOne(
            { _id: new ObjectId(partyId) },
            {
              $set: {
                members: updatedMembers,
                leaderUid: newLeaderUid,
              },
            }
          );
        }
      }
      // Remove partyId from user
      await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });
    }

    // 4. Mark Offline
    // We accept 'client' ('web' | 'unreal') to know which session ended
    const { client: clientType } = req.body;
    const updateDoc: any = {
      lastSeen: new Date(), // Update global last seen
    };

    const now = new Date().getTime();
    const ONLINE_THRESHOLD_MS = 60 * 1000;

    if (clientType === "unreal") {
      updateDoc.lastSeenUnreal = 0; // Expire Unreal session immediately
      updateDoc.status = "offline"; // Unreal logout usually means full offline
    } else if (clientType === "web") {
      updateDoc.lastSeenWeb = 0; // Expire Web session immediately

      // Check if Unreal is still online before setting status to offline
      const lastSeenUnreal = user.lastSeenUnreal
        ? new Date(user.lastSeenUnreal).getTime()
        : 0;
      const isUnrealOnline = now - lastSeenUnreal < ONLINE_THRESHOLD_MS;

      if (!isUnrealOnline) {
        updateDoc.status = "offline";
      }
      // If Unreal IS online, leave 'status' alone (it holds the Unreal status like "In Match")
    } else {
      // Fallback for legacy calls (assumes full logout)
      updateDoc.status = "offline";
      updateDoc.lastSeenWeb = 0;
      updateDoc.lastSeenUnreal = 0;
    }

    await users.updateOne(
      { _id: uid },
      {
        $set: updateDoc,
      }
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Leave] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
