import type { NextApiRequest, NextApiResponse } from "next";
import {
  GameLiftClient,
  StopMatchmakingCommand,
} from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    const decodedToken = await admin
      .auth()
      .verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    // 2. Call GameLift StopMatchmaking
    const command = new StopMatchmakingCommand({
      TicketId: ticketId,
    });

    await client.send(command);

    // 3. Clear Ticket ID from Party (if user is in one)
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
    const user = await db.collection("users").findOne({ _id: uid });

    if (user && user.partyId) {
      await db
        .collection("parties")
        .updateOne(
          { _id: new ObjectId(user.partyId) },
          { $unset: { matchmakingTicketId: "" } }
        );
    }

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
