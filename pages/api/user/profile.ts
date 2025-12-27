import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow GET
  if (req.method !== "GET") {
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
      console.error("[User Profile] Token verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }

    const uid = decodedToken.uid;

    // 3. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 4. Fetch User Data
    const user = await users.findOne({ _id: uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 5. Return User Data
    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("[User Profile] Internal Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
