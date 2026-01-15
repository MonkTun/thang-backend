import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import type {
  ProfileResponse,
  ProfileUpdateRequest,
  ErrorResponse,
} from "@/lib/types";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
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

    // 4. Handle GET (Fetch Profile)
    if (req.method === "GET") {
      const user = await users.findOne({ _id: uid });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user });
    }

    // 5. Handle POST (Update Profile)
    if (req.method === "POST") {
      const { avatarId, bannerId, equippedTitle } = req.body;
      const updateFields: any = { updated_at: new Date() };

      if (typeof avatarId === "string") updateFields.avatarId = avatarId;
      if (typeof bannerId === "string") updateFields.bannerId = bannerId;
      if (typeof equippedTitle === "string")
        updateFields.equippedTitle = equippedTitle;

      if (Object.keys(updateFields).length <= 1) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const result = await users.findOneAndUpdate(
        { _id: uid },
        { $set: updateFields },
        { returnDocument: "after" }
      );

      if (!result) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user: result });
    }
  } catch (error) {
    console.error("[User Profile] Internal Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
