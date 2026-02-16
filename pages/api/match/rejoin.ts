import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import {
  createRejoinPlayerSession,
  isGameSessionActive,
} from "@/lib/matchmaking";
import type { MatchConnectionInfo, ErrorResponse } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const decodedToken = await admin
      .auth()
      .verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: uid },
      {
        projection: {
          username: 1,
          activeMatchmakingSession: 1,
        },
      }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const session = user.activeMatchmakingSession as
      | {
          gameSessionId: string;
          ipAddress?: string;
          port?: number;
          joinedAt: Date;
        }
      | undefined;

    if (!session?.gameSessionId) {
      return res.status(404).json({
        error: "No active match to rejoin. Return to lobby and queue again.",
      });
    }

    const gameSessionId = session.gameSessionId;

    if (!(await isGameSessionActive(gameSessionId))) {
      await users.updateOne(
        { _id: uid },
        { $unset: { activeMatchmakingSession: "" } }
      );
      return res.status(410).json({
        error: "Match has ended. Return to lobby.",
      });
    }

    const playerSession = await createRejoinPlayerSession(gameSessionId, uid);

    if (!playerSession) {
      return res.status(503).json({
        error: "Could not rejoin match (session full or unavailable).",
      });
    }

    const connectionInfo: MatchConnectionInfo = {
      ipAddress: playerSession.ipAddress ?? session.ipAddress ?? "",
      port: playerSession.port ?? session.port ?? 7777,
      playerSessionId: playerSession.playerSessionId,
    };

    if (connectionInfo.ipAddress === "") {
      return res.status(503).json({
        error: "Connection info unavailable. Try again.",
      });
    }

    return res.status(200).json({
      connectionInfo,
      username: user.username || "Player",
    });
  } catch (error: any) {
    console.error("[Match Rejoin] Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
