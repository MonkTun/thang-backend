import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";
const COLLECTION_NAME = "login_sessions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface LoginSession {
  deviceCode: string;
  status: "pending" | "complete";
  createdAt: Date;
  expiresAt: Date;
  token?: string;
  userId?: string;
}

type ResponseData =
  | {
      deviceCode: string;
      verificationUrl: string;
      expiresIn: number;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessions = db.collection(COLLECTION_NAME);

    // Ensure TTL index exists (expires documents after expiresAt time)
    // expireAfterSeconds: 0 means it expires exactly at the date specified in expiresAt
    try {
      await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await sessions.createIndex({ deviceCode: 1 }, { unique: true });
    } catch (e) {
      console.warn("[AuthSession] Index creation warning:", e);
    }

    // Generate unique device code
    const deviceCode = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    const newSession: LoginSession = {
      deviceCode,
      status: "pending",
      createdAt: now,
      expiresAt: expiresAt,
    };

    await sessions.insertOne(newSession);

    return res.status(200).json({
      deviceCode,
      verificationUrl: `${BASE_URL}/verify?code=${deviceCode}`,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("[AuthSession] Start error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
