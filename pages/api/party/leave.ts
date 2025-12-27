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

    // 3. Get User & Party
    const user = await users.findOne({ _id: uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.partyId) {
      return res.status(400).json({ error: "You are not in a party" });
    }

    const partyId = user.partyId;
    const party = await parties.findOne({ _id: new ObjectId(partyId) });

    // 4. Remove User from Party
    if (party) {
      const updatedMembers = party.members.filter((m: any) => m.uid !== uid);

      if (updatedMembers.length === 0) {
        // Party empty -> Delete
        await parties.deleteOne({ _id: new ObjectId(partyId) });
      } else {
        // Party not empty -> Update members
        let newLeaderUid = party.leaderUid;
        if (party.leaderUid === uid) {
          // Promote next member (oldest joiner usually first in array)
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

    // 5. Update User Doc
    await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });

    return res.status(200).json({ message: "Left party" });
  } catch (error: any) {
    console.error("[Party Leave] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
