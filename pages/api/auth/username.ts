import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

interface User {
  _id: string;
  email: string;
  username?: string | null;
  rank: number;
  coins: number;
  created_at: Date;
  updated_at: Date;
}

type ResponseData = User | { error: string };

const USERNAME_REGEX = /^(?=.{3,20}$)[a-zA-Z0-9_-]+$/;

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract and verify Firebase token
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error: any) {
      console.error("[Username] Firebase verification error:", error.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const uid = decoded.uid;
    if (!uid) {
      return res.status(401).json({ error: "Invalid token: missing uid" });
    }

    const rawUsername = (req.body?.username as string | undefined)?.trim();
    if (!rawUsername) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!USERNAME_REGEX.test(rawUsername)) {
      return res.status(400).json({
        error:
          "Username must be 3-20 chars, letters/numbers/underscore/hyphen only",
      });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // Ensure unique sparse index on username
    try {
      await users.createIndex({ username: 1 }, { unique: true, sparse: true });
    } catch (indexError: any) {
      console.warn("[Username] Username index warning:", indexError.message);
    }

    // Check for conflicts (case-insensitive)
    const conflict = await users.findOne({
      username: { $regex: `^${escapeRegExp(rawUsername)}$`, $options: "i" },
      _id: { $ne: uid },
    });

    if (conflict) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const result = await users.findOneAndUpdate(
      { _id: uid },
      {
        $set: { username: rawUsername, updated_at: new Date() },
        $setOnInsert: {
          created_at: new Date(),
          email: decoded.email || "",
          rank: 0,
          coins: 100,
        },
      },
      { returnDocument: "after", upsert: true }
    );

    const updatedUser = result.value || (await users.findOne({ _id: uid }));

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("[Username] CRITICAL ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
