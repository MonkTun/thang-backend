import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing invite code" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    const user = await users.findOne(
      { inviteCode: code },
      { projection: { username: 1, avatarId: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    return res.status(200).json({
      username: user.username,
      avatarId: user.avatarId,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
