import type { NextApiRequest, NextApiResponse } from "next";
import {
  GameLiftClient,
  DescribeMatchmakingCommand,
} from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { gameSessionIdFromArn } from "@/lib/matchmaking";
import type {
  MatchmakingStatusResponse,
  MatchConnectionInfo,
  MatchedPlayerSession,
  ErrorResponse,
} from "@/lib/types";

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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticketId } = req.query;

  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ error: "Missing ticketId" });
  }

  try {
    // 1. Authenticate (Optional: You might want to verify the user owns the ticket)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    // In a real app, verify token matches the player in the ticket.
    // For now, we just check validity.
    const decodedToken = await admin
      .auth()
      .verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    // 2. Call GameLift DescribeMatchmaking
    const command = new DescribeMatchmakingCommand({
      TicketIds: [ticketId],
    });

    const response = await client.send(command);

    if (!response.TicketList || response.TicketList.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = response.TicketList[0];

    // If the ticket is in a terminal state, clear it from the database
    // so that the user isn't stuck in "Matchmaking" state on refresh.
    if (
      ticket.Status &&
      ["COMPLETED", "FAILED", "TIMED_OUT", "CANCELLED"].includes(ticket.Status)
    ) {
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
      await db
        .collection("parties")
        .updateOne(
          { matchmakingTicketId: ticketId },
          { $unset: { matchmakingTicketId: "" } }
        );
    }

    // 3. Return Status
    // Statuses: QUEUED, PLACING, COMPLETED, FAILED, TIMED_OUT, REQUIRES_ACCEPTANCE
    const result: any = {
      status: ticket.Status,
      startTime: ticket.StartTime,
      estimatedWaitTime: ticket.EstimatedWaitTime,
      statusReason: (ticket as any).StatusReason,
      statusMessage: (ticket as any).StatusMessage,
      gameSessionArn: (ticket as any).GameSessionArn,
    };

    // If match is found, return connection info and persist for rejoin
    if (ticket.Status === "COMPLETED" && ticket.GameSessionConnectionInfo) {
      const connInfo = ticket.GameSessionConnectionInfo;
      result.connectionInfo = {
        ipAddress: connInfo.IpAddress,
        port: connInfo.Port,
        dnsName: connInfo.DnsName,
      };

      // Find the specific PlayerSessionId for the requesting user (if possible)
      if (connInfo.MatchedPlayerSessions) {
        result.matchedPlayers = connInfo.MatchedPlayerSessions;

        const mySession = connInfo.MatchedPlayerSessions.find(
          (ps) => ps.PlayerId === uid
        );
        if (mySession) {
          result.connectionInfo.playerSessionId = mySession.PlayerSessionId;
        }

        // Persist game session for rejoin (all matched players can rejoin if disconnected)
        const gameSessionId = gameSessionIdFromArn(connInfo.GameSessionArn);
        if (gameSessionId) {
          const mongoClient = await clientPromise;
          const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
          const now = new Date();
          const sessionDoc = {
            gameSessionId,
            ipAddress: connInfo.IpAddress,
            port: connInfo.Port,
            joinedAt: now,
          };
          await db.collection("users").updateMany(
            {
              _id: { $in: connInfo.MatchedPlayerSessions.map((p) => p.PlayerId) },
            },
            { $set: { activeMatchmakingSession: sessionDoc } }
          );
        }
      }
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Matchmaking Status Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
