import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { privacy } = req.body;
    if (!privacy || (privacy !== "public" && privacy !== "private")) {
      return res
        .status(400)
        .json({ error: "Invalid privacy setting. Use 'public' or 'private'." });
    }

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const parties = db.collection("parties");

    // 3. Get User & Party
    const user = await users.findOne({ _id: uid });
    if (!user || !user.partyId) {
      return res.status(400).json({ error: "You are not in a party" });
    }

    const partyId = user.partyId;
    const party = await parties.findOne({ _id: new ObjectId(partyId) });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // 4. Verify Leadership
    if (party.leaderUid !== uid) {
      return res
        .status(403)
        .json({ error: "Only the leader can change settings" });
    }

    // 5. Update Settings
    await parties.updateOne(
      { _id: new ObjectId(partyId) },
      { $set: { privacy: privacy } }
    );

    return res.status(200).json({ message: `Party is now ${privacy}` });
  } catch (error: any) {
    console.error("[Party Settings] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
