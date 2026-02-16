import type { NextApiRequest, NextApiResponse } from "next";
import { Player } from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { COUNTRY_TO_REGION_MAP, DEFAULT_REGION } from "@/lib/regionUtils";
import {
  startMatchmaking,
  createPlayerObject,
  isTicketActive,
} from "@/lib/matchmaking";

function cleanLatencyMapForMatchmaking(
  latencyMap: any,
): Record<string, number> {
  const cleanLatencyMap: Record<string, number> = {};
  if (latencyMap && typeof latencyMap === "object") {
    for (const [region, latency] of Object.entries(latencyMap)) {
      const val = Number(latency);
      if (!isNaN(val)) {
        cleanLatencyMap[region] = Math.round(val);
      }
    }
  }

  // Debug override: if a custom location key exists, force it to 10ms.
  if (
    Object.prototype.hasOwnProperty.call(cleanLatencyMap, "custom-home-office")
  ) {
    cleanLatencyMap["custom-home-office"] = 10;
  }

  return cleanLatencyMap;
}

function toSkill(value: any): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

// USER DEFINITION FOR TYPE SAFETY
interface UserDocument {
  _id: string; // Firebase UID
  username: string;
  rank?: number;
  partyId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // PARSE REQUEST BODY
    // configName e.g. "Thang-Deathmatch-Config"
    let { configName, latencyMap } = req.body;

    if (!configName) {
      return res.status(400).json({ error: "Missing configName" });
    }

    // If "deathmatch" => force "AllPlayers".
    // Otherwise, use undefined so GameLift handles assignment (Red/Blue).
    let teamName: string | undefined;
    if (configName.toLowerCase().includes("deathmatch")) {
      teamName = "AllPlayers";
    }

    // LATENCY MAP AUTO-GENERATION
    if (!latencyMap || Object.keys(latencyMap).length === 0) {
      const country = (req.headers["x-vercel-ip-country"] as string) || "US"; // Fallback to US
      latencyMap = {};

      const preferredRegions =
        COUNTRY_TO_REGION_MAP[country.toUpperCase()] ||
        COUNTRY_TO_REGION_MAP["US"];

      // Assign fake latency 50ms, 60ms, etc.
      preferredRegions.forEach((region, index) => {
        latencyMap[region] = 50 + index * 10;
      });

      // FALLBACK LATENCY FOR THE DEFAULT REGION
      if (!latencyMap[DEFAULT_REGION]) {
        latencyMap[DEFAULT_REGION] = 150;
      }

      console.log(
        `[Matchmaking] Auto-generated latency map for ${country}:`,
        latencyMap,
      );
    }

    // GET User/Party Data from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
    const user = await db.collection("users").findOne({ _id: uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let playersToMatch: Player[] = [];
    const latencyUpdates: Array<{
      uid: string;
      latencyMap: Record<string, number>;
    }> = [];

    // PARTY LOGIC GOES HERE
    if (user.partyId) {
      const party = await db
        .collection("parties")
        .findOne({ _id: new ObjectId(user.partyId) });

      if (!party) {
        // SHOULD BE IMPOSSIBLE unless data inconsistency
        const cleanLatencyMap = cleanLatencyMapForMatchmaking(latencyMap);

        latencyUpdates.push({ uid, latencyMap: cleanLatencyMap });
        playersToMatch.push(
          createPlayerObject(
            uid,
            user.username,
            toSkill(user.rank),
            cleanLatencyMap,
            teamName,
          ),
        );
      } else {
        // ONLY the party leader can start matchmaking
        if (party.leaderUid !== uid) {
          return res
            .status(403)
            .json({ error: "Only the party leader can start matchmaking" });
        }

        // Fetch all party members' data to get their ranks
        const memberUids = party.members.map((m: any) => m.uid);
        const memberDocs = await db
          .collection("users")
          .find({ _id: { $in: memberUids } })
          .toArray();

        // Create a strictly typed Map
        const memberMap = new Map<string, UserDocument>(
          memberDocs.map((doc) => [doc._id, doc]),
        );

        // Add all members
        party.members.forEach((member: any) => {
          const memberDoc = memberMap.get(member.uid);
          const rank = toSkill(memberDoc?.rank);
          const username =
            memberDoc?.username || member.username || "UnknownPlayer";

          const cleanLatencyMap = cleanLatencyMapForMatchmaking(latencyMap);

          latencyUpdates.push({ uid: member.uid, latencyMap: cleanLatencyMap });

          playersToMatch.push(
            createPlayerObject(
              member.uid,
              username,
              rank,
              cleanLatencyMap,
              teamName,
            ),
          );
        });
      }
    } else {
      // Solo Queue
      const cleanLatencyMap = cleanLatencyMapForMatchmaking(latencyMap);

      latencyUpdates.push({ uid, latencyMap: cleanLatencyMap });
      playersToMatch.push(
        createPlayerObject(
          uid,
          user.username || "UnknownPlayer",
          toSkill(user.rank),
          cleanLatencyMap,
          teamName,
        ),
      );
    }

    // Persist latest latency map(s) for later server-side use (e.g. backfill/lobbies)
    if (latencyUpdates.length > 0) {
      try {
        const usersCol = db.collection("users");
        const now = new Date();
        await usersCol.bulkWrite(
          latencyUpdates.map((u) => ({
            updateOne: {
              filter: { _id: u.uid },
              update: {
                $set: {
                  latestLatencyMap: u.latencyMap,
                  latestLatencyMapUpdatedAt: now,
                },
              },
            },
          })),
          { ordered: false },
        );
      } catch (e) {
        console.warn("[Matchmaking] Failed to persist latency map:", e);
      }
    }

    // PREVENT DUPLICATES: Check if party already has an active matchmaking ticket
    const partyToCheck = user.partyId
      ? await db
          .collection("parties")
          .findOne(
            { _id: new ObjectId(user.partyId) },
            { projection: { matchmakingTicketId: 1 } },
          )
      : null;

    const existingTicketId = partyToCheck?.matchmakingTicketId;
    if (existingTicketId && (await isTicketActive(existingTicketId))) {
      return res.status(409).json({
        error: "Matchmaking already in progress. Cancel the current search first.",
        ticketId: existingTicketId,
      });
    }

    // CALL GAMELIFT START MATCHMAKING
    const { ticketId, estimatedWaitTime } = await startMatchmaking(
      configName,
      playersToMatch,
    );

    // UPDATE PARTY WITH TICKET ID
    if (user.partyId) {
      await db
        .collection("parties")
        .updateOne(
          { _id: new ObjectId(user.partyId) },
          { $set: { matchmakingTicketId: ticketId } },
        );
    }

    // RETURN TICKET ID
    // use this ID to poll /api/matchmaking/status
    return res.status(200).json({
      ticketId: ticketId,
      status: "QUEUED",
      estimatedWaitTime: estimatedWaitTime,
    });
  } catch (error: any) {
    console.error("Matchmaking Queue Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
