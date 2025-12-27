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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract and validate Firebase token
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    // Verify Firebase ID token
    let decoded;
    try {
      console.log("[Bootstrap] Verifying Firebase token...");
      decoded = await admin.auth().verifyIdToken(token);
      console.log("[Bootstrap] Token verified for UID:", decoded.uid);
    } catch (error: any) {
      console.error("[Bootstrap] Firebase verification error:", error.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const uid = decoded.uid;
    const email = decoded.email || "";

    if (!uid) {
      return res.status(401).json({ error: "Invalid token: missing uid" });
    }

    // Connect to MongoDB
    console.log("[Bootstrap] Connecting to MongoDB...");
    const client = await clientPromise;
    console.log("[Bootstrap] Connected to MongoDB");

    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // Ensure username uniqueness without forcing it on existing docs
    try {
      await users.createIndex({ username: 1 }, { unique: true, sparse: true });
    } catch (indexError: any) {
      // Log and continue if index already exists or cannot be created
      console.warn("[Bootstrap] Username index warning:", indexError.message);
    }

    // _id already has a unique index by default; no need to recreate

    // Try to find existing user
    console.log("[Bootstrap] Looking for existing user:", uid);
    let user = await users.findOne({ _id: uid });
    console.log("[Bootstrap] User found:", user ? "yes" : "no");

    // If user doesn't exist, create a new one
    if (!user) {
      const newUser: User = {
        _id: uid,
        email,
        username: null,
        rank: 0,
        coins: 100,
        created_at: new Date(),
        updated_at: new Date(),
      };

      try {
        console.log("[Bootstrap] Creating new user:", uid);
        await users.insertOne(newUser);
        user = newUser;
        console.log("[Bootstrap] User created successfully");
      } catch (insertError: any) {
        // Handle race condition where user was created between findOne and insertOne
        if (insertError.code === 11000) {
          console.log(
            "[Bootstrap] Race condition detected, fetching user again"
          );
          user = await users.findOne({ _id: uid });
          if (!user) {
            throw insertError;
          }
        } else {
          throw insertError;
        }
      }
    }

    console.log("[Bootstrap] Returning user data");
    return res.status(200).json(user);
  } catch (error) {
    console.error(
      "[Bootstrap] CRITICAL ERROR:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error) {
      console.error("[Bootstrap] Stack:", error.stack);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
