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

    // --- CLEANUP INVITES ---
    let partyInvites = user.partyInvites || [];
    let invitesChanged = false;
    const validInvites: any[] = [];

    if (partyInvites.length > 0) {
      // Extract IDs safely
      const partyIds = partyInvites
        .map((inv: any) => {
          try {
            return new ObjectId(inv.partyId);
          } catch (e) {
            return null;
          }
        })
        .filter((id: any) => id !== null) as ObjectId[];

      const foundParties = await parties
        .find({ _id: { $in: partyIds } })
        .toArray();

      const partyMap = new Map<string, any>();
      foundParties.forEach((p: any) => {
        if (p._id) partyMap.set(p._id.toString(), p);
      });

      for (const invite of partyInvites) {
        const party = partyMap.get(invite.partyId.toString());

        // 1. Party must exist
        if (!party) {
          invitesChanged = true;
          continue;
        }

        // 2. Leader must match (if recorded in invite)
        if (invite.leaderUid && party.leaderUid !== invite.leaderUid) {
          invitesChanged = true;
          continue;
        }

        validInvites.push(invite);
      }

      if (invitesChanged) {
        await users.updateOne(
          { _id: uid },
          { $set: { partyInvites: validInvites } }
        );
        partyInvites = validInvites;
      }
    }

    const response: any = {
      partyId: user.partyId || null,
      partyInvites: partyInvites,
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

          // Only show joinRequests to the leader
          if (party.leaderUid === uid) {
            let joinRequests = party.joinRequests || [];
            let requestsChanged = false;

            // Filter out requests from users who are already members
            const memberIds = new Set(party.members.map((m: any) => m.uid));
            const validRequests = [];

            for (const req of joinRequests) {
              if (memberIds.has(req.uid)) {
                requestsChanged = true;
                continue;
              }
              validRequests.push(req);
            }

            if (requestsChanged) {
              await parties.updateOne(
                { _id: party._id },
                { $set: { joinRequests: validRequests } }
              );
              joinRequests = validRequests;
            }

            party.joinRequests = joinRequests;
          } else {
            delete party.joinRequests;
          }

          response.party = party;
        }
      } else {
        // Stale partyId fix
        await users.updateOne({ _id: uid }, { $unset: { partyId: "" } });
        response.partyId = null;
        response.party = null; // Explicitly set party to null
      }
    }

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("[Party Status] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
