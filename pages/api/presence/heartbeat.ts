import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type {
  HeartbeatRequest,
  HeartbeatResponse,
  ErrorResponse,
  CurrentGameInfo,
} from "@/lib/types";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

/**
 * Heartbeat API - Updates presence and game state
 *
 * Body params:
 * - client: 'web' | 'unreal'
 * - status: string (e.g., 'online', 'in-lobby', 'in-game', 'in-menu')
 * - gameSessionId: string | null - EOS session ID or AWS GameSession ID (null = not in game)
 * - gameType: 'matchmaking' | 'custom' | null - Type of game session
 * - isHost: boolean - Whether this player is hosting (for custom games)
 *
 * When gameSessionId is set:
 * - Updates user's currentGame info
 * - If user is party leader, updates party so members can auto-join
 *
 * When gameSessionId is null/cleared:
 * - Clears user's currentGame info
 * - If user was party leader hosting, clears party's game info
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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
    const mongoClient = await clientPromise;
    const db = mongoClient.db(DB_NAME);
    const users = db.collection("users");
    const parties = db.collection("parties");

    // 3. Parse body
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.warn("[Heartbeat] Failed to parse body string:", body);
        body = {};
      }
    }

    const { status, client, gameSessionId, gameType, isHost } = body;
    const clientType = client === "unreal" ? "unreal" : "web";
    const now = new Date();

    // 4. Build update document
    const updateDoc: any = {
      lastSeen: now,
    };
    const unsetDoc: any = {};

    if (clientType === "unreal") {
      updateDoc.lastSeenUnreal = now;

      // Update status
      if (status) {
        updateDoc.status = status;
      } else {
        updateDoc.status = "online";
      }

      // Handle game session state
      if (gameSessionId) {
        // Player is in a game
        updateDoc.currentGame = {
          sessionId: gameSessionId,
          type: gameType || "custom", // 'matchmaking' or 'custom'
          isHost: !!isHost,
          joinedAt: now,
        };
      } else if (gameSessionId === null) {
        // Explicitly clearing game state (player left game)
        unsetDoc.currentGame = "";
        unsetDoc.activeMatchmakingSession = ""; // Also clear rejoin eligibility
      }
      // If gameSessionId is undefined, don't touch currentGame (normal heartbeat)
    } else {
      // Web client
      updateDoc.lastSeenWeb = now;
    }

    // 5. Update user
    const updateOp: any = { $set: updateDoc };
    if (Object.keys(unsetDoc).length > 0) {
      updateOp.$unset = unsetDoc;
    }

    const userBefore = await users.findOneAndUpdate({ _id: uid }, updateOp, {
      returnDocument: "before",
      projection: { partyId: 1, currentGame: 1 },
    });

    // 6. Update party if leader changed game state (for party auto-join)
    if (clientType === "unreal" && userBefore?.partyId) {
      try {
        const partyOid = new ObjectId(userBefore.partyId);
        const party = await parties.findOne(
          { _id: partyOid },
          { projection: { leaderUid: 1 } },
        );

        // Only update party if this user is the leader
        if (party && party.leaderUid === uid) {
          if (gameSessionId && isHost) {
            // Leader started hosting a game - update party so members can join
            await parties.updateOne(
              { _id: partyOid },
              {
                $set: {
                  leaderGame: {
                    sessionId: gameSessionId,
                    type: gameType || "custom",
                    startedAt: now,
                  },
                },
              },
            );
          } else if (gameSessionId === null && userBefore.currentGame?.isHost) {
            // Leader left a game they were hosting - clear party's game info
            await parties.updateOne(
              { _id: partyOid },
              { $unset: { leaderGame: "" } },
            );
          }
        }
      } catch (e) {
        // Party update is non-critical, don't fail the heartbeat
        console.warn("[Heartbeat] Failed to update party game state:", e);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Heartbeat] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
