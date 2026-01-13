import type { NextApiRequest, NextApiResponse } from "next";
import { Player } from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { COUNTRY_TO_REGION_MAP, DEFAULT_REGION } from "@/lib/regionUtils";
import { startMatchmaking, createPlayerObject } from "@/lib/matchmaking";

function cleanLatencyMapForMatchmaking(
  latencyMap: any
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

// Define the shape of your User document
interface UserDocument {
  _id: string; // Firebase UID
  username: string;
  rank?: number;
  partyId?: string;
}

// Map configuration names to specific Team Names.
// For FFA modes like 'Thang-Deathmatch', we force 'AllPlayers' so GameLift doesn't generate 'AllPlayers1'.
// For Team modes, we might leave it undefined to let GameLift or a randomizer handle it.
const TEAM_CONFIG_MAP: Record<string, string | undefined> = {
  "Thang-Deathmatch": "AllPlayers",
  // Add other modes here, e.g.:
  // "Thang-CaptureTheFlag": undefined, // Let GameLift decide or handle logic below
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Parse Request Body
    // configName: The exact name of the Matchmaking Configuration in AWS (e.g. "Thang-Deathmatch-Config")
    // MAP SELECTION: The `configName` determines which rule set and GameLift Queue is used.
    // To support multiple maps (e.g. "Ice Arena", "Desert"), create separate Matchmaking Configurations in AWS
    // backed by the same Fleet (or different Fleets) and pass the map path as a "Game Property" in the AWS Console.
    // Then, the client simply requests the specific configName for the map they want.
    let { configName, latencyMap } = req.body;

    if (!configName) {
      return res.status(400).json({ error: "Missing configName" });
    }

    // Determine the team name based on the config
    // Default to "AllPlayers" if not specified in the map (handles unknown configs)
    const teamName = TEAM_CONFIG_MAP[configName] || "AllPlayers";

    // --- AUTO-GENERATE LATENCY MAP (If Client didn't provide it) ---
    // Since the client cannot ping AWS directly, we estimate latency based on their Country.
    if (!latencyMap || Object.keys(latencyMap).length === 0) {
      const country = (req.headers["x-vercel-ip-country"] as string) || "US"; // Default to US if unknown
      latencyMap = {};

      const preferredRegions =
        COUNTRY_TO_REGION_MAP[country.toUpperCase()] ||
        COUNTRY_TO_REGION_MAP["US"];

      // Assign artificial latency: 1st pref = 50ms, 2nd = 60ms, etc.
      // This tells GameLift "This player is close to these regions".
      preferredRegions.forEach((region, index) => {
        latencyMap[region] = 50 + index * 10;
      });

      // Ensure default region is always included as a fallback
      if (!latencyMap[DEFAULT_REGION]) {
        latencyMap[DEFAULT_REGION] = 150; // Higher latency for fallback
      }

      console.log(
        `[Matchmaking] Auto-generated latency map for ${country}:`,
        latencyMap
      );
    }

    // 3. Get User/Party Data from MongoDB
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

    // 4. Handle Party Logic
    if (user.partyId) {
      const party = await db
        .collection("parties")
        .findOne({ _id: new ObjectId(user.partyId) });

      if (!party) {
        // Inconsistent state, treat as solo
        const cleanLatencyMap = cleanLatencyMapForMatchmaking(latencyMap);

        latencyUpdates.push({ uid, latencyMap: cleanLatencyMap });
        playersToMatch.push(
          createPlayerObject(
            uid,
            user.username,
            toSkill(user.rank),
            cleanLatencyMap,
            teamName
          )
        );
      } else {
        // Check if requester is leader
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
          memberDocs.map((doc) => [doc._id, doc])
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
              teamName
            )
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
          teamName
        )
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
          { ordered: false }
        );
      } catch (e) {
        console.warn("[Matchmaking] Failed to persist latency map:", e);
      }
    }

    // 5. Call GameLift StartMatchmaking
    const { ticketId, estimatedWaitTime } = await startMatchmaking(
      configName,
      playersToMatch
    );

    // 6. Update Party with Ticket ID (if in a party)
    if (user.partyId) {
      await db
        .collection("parties")
        .updateOne(
          { _id: new ObjectId(user.partyId) },
          { $set: { matchmakingTicketId: ticketId } }
        );
    }

    // 7. Return Ticket ID
    // The client will use this ID to poll /api/matchmaking/status
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
