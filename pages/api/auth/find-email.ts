import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // Case insensitive search
    const user = await users.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.email) {
      return res
        .status(404)
        .json({ error: "No email associated with this user" });
    }

    // Mask email (e.g., "j***@gmail.com")
    const [local, domain] = user.email.split("@");
    const maskedLocal =
      local.length > 2
        ? local[0] + "***" + local[local.length - 1]
        : local + "***";
    const maskedEmail = `${maskedLocal}@${domain}`;

    return res.status(200).json({ email: maskedEmail });
  } catch (error: any) {
    console.error("[Find Email] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
