import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

function asString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Public endpoint by design (no auth)
  const uid = asString(req.query.uid);
  const username = asString(req.query.username);
  const inviteCode = asString(req.query.inviteCode);

  if (!uid && !username && !inviteCode) {
    return res.status(400).json({
      error: "Missing uid, username, or inviteCode",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    const filter: any = uid
      ? { _id: uid }
      : username
      ? { username }
      : { inviteCode };

    // Intentionally safe projection (no email, no tokens, no partyId, etc.)
    const user = await users.findOne(filter, {
      projection: {
        _id: 1,
        username: 1,
        rank: 1,
        avatarId: 1,
        bannerId: 1,
        equippedTitle: 1,
        latestLatencyMap: 1,
        latestLatencyMapUpdatedAt: 1,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("[User Public] Internal Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
