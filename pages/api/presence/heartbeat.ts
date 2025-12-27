import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

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

    // Optimization: Verify token is valid, but maybe don't need full user record every heartbeat if perf is concern.
    // For now, standard verification is safest.
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const uid = decodedToken.uid;

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Update Presence
    // We update 'lastSeen' to now.
    // We can also accept a 'status' from the client (e.g. "lobby", "matchmaking", "in-game")
    const { status } = req.body;
    const validStatus =
      status && typeof status === "string" ? status : "online";

    await users.updateOne(
      { _id: uid },
      {
        $set: {
          lastSeen: new Date(),
          status: validStatus,
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Heartbeat] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
