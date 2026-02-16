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

// Helper to clear local matchmaking state from MongoDB
async function clearLocalMatchmakingState(uid: string, ticketId: string) {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
  const user = await db.collection("users").findOne({ _id: uid });

  if (user && user.partyId) {
    // Unset ticket to clear matchmaking state
    await db
      .collection("parties")
      .updateOne(
        { _id: new ObjectId(user.partyId) },
        { $unset: { matchmakingTicketId: "" } },
      );
  }

  // Also clear by ticketId directly (in case user left party but ticket still exists)
  await db
    .collection("parties")
    .updateOne(
      { matchmakingTicketId: ticketId },
      { $unset: { matchmakingTicketId: "" } },
    );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticketId } = req.body;

  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticketId" });
  }

  // 1. Authenticate
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  let uid: string;
  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(authHeader.split("Bearer ")[1]);
    uid = decodedToken.uid;
  } catch (authError) {
    return res.status(401).json({ error: "Invalid auth token" });
  }

  // 2. Try to call GameLift StopMatchmaking
  let gameLiftError: any = null;
  try {
    const command = new StopMatchmakingCommand({
      TicketId: ticketId,
    });
    await client.send(command);
  } catch (error: any) {
    gameLiftError = error;
    console.warn("GameLift StopMatchmaking error:", error?.message || error);
  }

  // Handle specific GameLift errors BEFORE clearing state
  const errorMsg = gameLiftError?.message || "";
  const errorName = gameLiftError?.name || "";

  // "Cannot cancel in PLACING status" — AWS refuses; do NOT clear state
  // User must wait for placement to complete (success or fail)
  if (errorName === "InvalidRequestException" && errorMsg.includes("PLACING")) {
    return res.status(409).json({
      error: "Match is already being placed. Cannot cancel. Please wait.",
      cleared: false,
    });
  }

  // 3. Clear local state when safe to do so:
  // - GameLift successfully cancelled, OR
  // - Ticket already in terminal state / not found
  try {
    await clearLocalMatchmakingState(uid, ticketId);
  } catch (dbError) {
    console.error("Failed to clear local matchmaking state:", dbError);
  }

  // 4. Return appropriate response
  if (!gameLiftError) {
    return res.status(200).json({ message: "Matchmaking cancelled" });
  }

  // Ticket already in terminal state or not found — we cleared local state
  if (
    errorMsg.includes("COMPLETED") ||
    errorMsg.includes("CANCELLED") ||
    errorMsg.includes("TIMED_OUT") ||
    errorMsg.includes("FAILED") ||
    errorName === "NotFoundException" ||
    errorMsg.includes("not found") ||
    errorMsg.includes("does not exist")
  ) {
    return res.status(200).json({
      message: "Matchmaking already ended. Local state cleared.",
      reason: errorMsg,
    });
  }

  // Unknown error — we cleared local state as a fallback
  console.error("Matchmaking Leave Error (unhandled):", gameLiftError);
  return res.status(200).json({
    message: "Local matchmaking state cleared.",
    warning: "GameLift returned an error, but local state was cleaned up.",
    gameLiftError: errorMsg,
  });
}
