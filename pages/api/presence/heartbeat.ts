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
    const mongoClient = await clientPromise;
    const db = mongoClient.db(DB_NAME);
    const users = db.collection("users");

    // 3. Update Presence
    // We accept 'client' ('web' | 'unreal') and 'status'
    let body = req.body;
    // Robustness: Handle case where body is not parsed automatically
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.warn("[Heartbeat] Failed to parse body string:", body);
      }
    }

    const { status, client } = body;
    console.log(
      `[Heartbeat] Received from ${uid}: client=${client}, status=${status}`
    );

    const clientType = client === "unreal" ? "unreal" : "web";
    const now = new Date();

    const updateDoc: any = {
      lastSeen: now, // Global last seen
    };

    if (clientType === "unreal") {
      updateDoc.lastSeenUnreal = now;
      // Only Unreal updates the rich presence status (e.g. "In Lobby", "Playing")
      if (status) {
        updateDoc.status = status;
      } else {
        updateDoc.status = "in-game"; // Default for Unreal
      }
    } else {
      updateDoc.lastSeenWeb = now;
      // Web does not overwrite 'status' so we don't clobber "In Game"
      // But if we want to clear "In Game" when Unreal crashes?
      // We handle that in the read logic (friends/list.ts) by checking timestamps.
    }

    await users.updateOne(
      { _id: uid },
      {
        $set: updateDoc,
      }
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Heartbeat] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
