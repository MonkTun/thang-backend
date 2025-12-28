import type { NextApiRequest, NextApiResponse } from "next";
import {
  GameLiftClient,
  StartMatchmakingCommand,
  Player,
} from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Define the shape of your User document
interface UserDocument {
  _id: string; // Firebase UID
  username: string;
  rank?: number;
  partyId?: string;
}

// Initialize GameLift Client
const client = new GameLiftClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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
    const { configName, latencyMap = {} } = req.body;

    if (!configName) {
      return res.status(400).json({ error: "Missing configName" });
    }

    // 3. Get User/Party Data from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
    const user = await db.collection("users").findOne({ _id: uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let playersToMatch: Player[] = [];

    // 4. Handle Party Logic
    if (user.partyId) {
      const party = await db
        .collection("parties")
        .findOne({ _id: new ObjectId(user.partyId) });

      if (!party) {
        // Inconsistent state, treat as solo
        playersToMatch.push(
          createPlayerObject(uid, user.username, user.rank || 100, latencyMap)
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
          const rank = memberDoc?.rank || 100;
          playersToMatch.push(
            createPlayerObject(member.uid, member.username, rank, latencyMap)
          );
        });
      }
    } else {
      // Solo Queue
      playersToMatch.push(
        createPlayerObject(uid, user.username, user.rank || 100, latencyMap)
      );
    }

    // 5. Call GameLift StartMatchmaking
    const command = new StartMatchmakingCommand({
      ConfigurationName: configName,
      Players: playersToMatch,
      // TicketId: Optional, AWS generates one if omitted.
    });

    const response = await client.send(command);

    // 6. Return Ticket ID
    // The client will use this ID to poll /api/matchmaking/status
    return res.status(200).json({
      ticketId: response.MatchmakingTicket?.TicketId,
      status: "QUEUED",
      estimatedWaitTime: response.MatchmakingTicket?.EstimatedWaitTime,
    });
  } catch (error: any) {
    console.error("Matchmaking Queue Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}

// Helper to format Player object for GameLift
function createPlayerObject(
  playerId: string,
  username: string,
  skill: number,
  latencyMap: Record<string, number>
): Player {
  return {
    PlayerId: playerId,
    PlayerAttributes: {
      skill: { N: skill },
      username: { S: username },
    },
    LatencyInMs: latencyMap, // GameLift expects { "region": latency }
  };
}
