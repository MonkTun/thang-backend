import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import admin from "@/lib/firebaseAdmin";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";
const COLLECTION_NAME = "login_sessions";

type ResponseData = { success: boolean } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { deviceCode, idToken } = req.body;

  if (!deviceCode || !idToken) {
    return res.status(400).json({ error: "Missing deviceCode or idToken" });
  }

  try {
    // 1. Verify Firebase Token
    let decodedToken;
    try {
      // checkRevoked: true ensures we check if the user was disabled or token revoked
      decodedToken = await admin.auth().verifyIdToken(idToken, true);
    } catch (e) {
      console.error("[AuthSession] Token verification failed:", e);
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    const userId = decodedToken.uid;

    // 2. Update Session in MongoDB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessions = db.collection(COLLECTION_NAME);

    const result = await sessions.updateOne(
      {
        deviceCode: deviceCode,
        status: "pending",
        expiresAt: { $gt: new Date() }, // Ensure session hasn't expired (TTL is not instant)
      },
      {
        $set: {
          status: "complete",
          token: idToken,
          userId: userId,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[AuthSession] Confirm error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
