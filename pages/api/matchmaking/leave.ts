import type { NextApiRequest, NextApiResponse } from "next";
import {
  GameLiftClient,
  StopMatchmakingCommand,
} from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";

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

  const { ticketId } = req.body;

  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticketId" });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);

    // 2. Call GameLift StopMatchmaking
    const command = new StopMatchmakingCommand({
      TicketId: ticketId,
    });

    await client.send(command);

    return res.status(200).json({ message: "Matchmaking cancelled" });
  } catch (error: any) {
    console.error("Matchmaking Leave Error:", error);

    // Handle "Cannot cancel in PLACING status" error
    if (
      error.name === "InvalidRequestException" &&
      error.message?.includes("PLACING")
    ) {
      return res
        .status(409)
        .json({ error: "Match is already being placed. Cannot cancel." });
    }

    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
