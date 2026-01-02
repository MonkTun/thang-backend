import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

function generateInviteCode(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // Generate new code
    // In a production app with millions of users, we'd check for collisions.
    // With 62^8 combinations, it's extremely unlikely.
    const newCode = generateInviteCode();

    await users.updateOne(
      { _id: uid },
      { $set: { inviteCode: newCode, updated_at: new Date() } }
    );

    return res.status(200).json({ inviteCode: newCode });
  } catch (error) {
    console.error("Regenerate invite error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
