import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";
const COLLECTION_NAME = "login_sessions";

type ResponseData =
  | { status: "pending" | "expired" }
  | { status: "complete"; token: string; userId: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing or invalid device code" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessions = db.collection(COLLECTION_NAME);

    const session = await sessions.findOne({ deviceCode: code });

    // Check if session exists AND is not expired
    if (!session || new Date() > new Date(session.expiresAt)) {
      return res.status(404).json({ status: "expired" });
    }

    if (session.status === "pending") {
      return res.status(200).json({ status: "pending" });
    }

    if (session.status === "complete" && session.token && session.userId) {
      // CRITICAL: Delete the session immediately to prevent replay attacks
      await sessions.deleteOne({ _id: session._id });

      return res.status(200).json({
        status: "complete",
        token: session.token,
        userId: session.userId,
      });
    }

    // Fallback for invalid state
    return res.status(500).json({ error: "Invalid session state" });
  } catch (error) {
    console.error("[AuthSession] Poll error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
