import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  startMatchmaking,
  stopMatchmaking,
  createPlayerObject,
} from "@/lib/matchmaking";
import { Player } from "@aws-sdk/client-gamelift";

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

    const { isReady, latencyMap } = req.body;
    if (typeof isReady !== "boolean") {
      return res.status(400).json({ error: "isReady must be a boolean" });
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

    // 4. Update Ready Status & Latency
    const updateFields: any = { "members.$.isReady": isReady };
    if (latencyMap) {
      updateFields["members.$.latencyMap"] = latencyMap;
    }

    const result = await parties.updateOne(
      { _id: new ObjectId(partyId), "members.uid": uid },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Party or member not found" });
    }

    // 5. Check if All Members are Ready (and trigger matchmaking)
    if (isReady) {
      const party = await parties.findOne({ _id: new ObjectId(partyId) });
      if (party && party.gameMode) {
        const allReady = party.members.every((m: any) => m.isReady);

        if (allReady) {
          console.log(
            `[Party Ready] All members ready in party ${partyId}. Starting matchmaking...`
          );

          // Fetch user ranks
          const memberUids = party.members.map((m: any) => m.uid);
          const memberDocs = await users
            .find({ _id: { $in: memberUids } })
            .toArray();
          const memberMap = new Map(memberDocs.map((doc) => [doc._id, doc]));

          const playersToMatch: Player[] = [];

          party.members.forEach((member: any) => {
            const memberDoc = memberMap.get(member.uid);
            const rank = (memberDoc as any)?.rank || 100;
            // Use member's stored latency, or fallback to empty (GameLift might use GeoIP if configured or fail)
            // Ideally we should have a fallback here if latency is missing.
            const pLatency = member.latencyMap || {};
            playersToMatch.push(
              createPlayerObject(member.uid, member.username, rank, pLatency)
            );
          });

          try {
            const { ticketId } = await startMatchmaking(
              party.gameMode,
              playersToMatch
            );

            await parties.updateOne(
              { _id: new ObjectId(partyId) },
              { $set: { matchmakingTicketId: ticketId } }
            );

            return res.status(200).json({
              message: `Ready status set to true. Matchmaking started.`,
              matchmakingStarted: true,
              ticketId,
            });
          } catch (mmError: any) {
            console.error("[Party Ready] Auto-matchmaking failed:", mmError);
            // Don't fail the ready request, but maybe unready everyone?
            // For now, just return success for ready, but log error.
            // Or return a warning.
          }
        }
      }
    } else {
      // User unreadied. If there is an active matchmaking ticket, cancel it.
      const party = await parties.findOne({ _id: new ObjectId(partyId) });
      if (party && party.matchmakingTicketId) {
        console.log(
          `[Party Ready] User unreadied. Cancelling ticket ${party.matchmakingTicketId}`
        );
        try {
          await stopMatchmaking(party.matchmakingTicketId);
        } catch (e) {
          console.warn(
            "[Party Ready] Failed to stop matchmaking on GameLift (might be already finished/cancelled):",
            e
          );
        }

        await parties.updateOne(
          { _id: new ObjectId(partyId) },
          { $unset: { matchmakingTicketId: "" } }
        );
      }
    }

    return res.status(200).json({ message: `Ready status set to ${isReady}` });
  } catch (error: any) {
    console.error("[Party Ready] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
