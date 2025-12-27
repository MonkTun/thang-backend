import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Verify Bearer Token (Firebase ID Token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error("[Game Bootstrap] Token verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }

    const uid = decodedToken.uid;
    console.log(`[Game Bootstrap] Authenticated user: ${uid}`);

    // 3. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 4. Fetch User Data
    let user = await users.findOne({ _id: uid });

    // 5. If user doesn't exist, create them (First time login from Game)
    if (!user) {
      console.log(`[Game Bootstrap] Creating new user for ${uid}`);
      const newUser = {
        _id: uid,
        email: decodedToken.email || "",
        username: null, // Will need to be set later or via Steam name if available
        rank: 0,
        coins: 100,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await users.insertOne(newUser);
      user = newUser;
    }

    // 6. Return Game Data
    // You can extend this to return inventory, stats, etc.
    return res.status(200).json({
      user: user,
      serverTime: new Date().toISOString(),
      config: {
        // Example game config
        version: "1.0.0",
        maintenance: false,
      },
    });
  } catch (error: any) {
    console.error("[Game Bootstrap] Internal Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
