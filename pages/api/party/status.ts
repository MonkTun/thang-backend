import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    // 3. Get User
    const user = await users.findOne({ _id: uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const response: any = {
      partyId: user.partyId || null,
      partyInvites: user.partyInvites || [],
    };

    // 4. If in party, fetch details
    if (user.partyId) {
      const party = await parties.findOne({ _id: new ObjectId(user.partyId) });
      if (party) {
        // Check if user is actually in the party members
        const isMember = party.members.some((m: any) => m.uid === uid);

        if (!isMember) {
          // Inconsistency detected: User thinks they are in party, but party doesn't have them
          console.warn(
            `[Party Status] Inconsistency: User ${uid} has partyId ${user.partyId} but is not in members list. Fixing...`
          );

          // Remove partyId from user
          await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });
          response.partyId = null;
        } else {
          // Hydrate members with avatarId and bannerId
          const memberUids = party.members.map((m: any) => m.uid);
          const membersData = await users
            .find(
              { _id: { $in: memberUids } },
              { projection: { avatarId: 1, bannerId: 1 } }
            )
            .toArray();

          const membersMap = new Map(membersData.map((m) => [m._id, m]));

          party.members = party.members.map((m: any) => ({
            ...m,
            avatarId: (membersMap.get(m.uid) as any)?.avatarId || "Alpha",
            bannerId: (membersMap.get(m.uid) as any)?.bannerId || "Alpha",
            isReady: m.isReady || false, // Ensure isReady is returned
          }));

          response.party = party;
        }
      } else {
        // Stale partyId fix
        await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });
        response.partyId = null;
      }
    }

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("[Party Status] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
