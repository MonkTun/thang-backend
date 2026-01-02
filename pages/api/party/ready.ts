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

    const { isReady } = req.body;
    if (typeof isReady !== "boolean") {
      return res.status(400).json({ error: "isReady must be a boolean" });
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

    // 4. Update Ready Status
    // We use arrayFilters to update the specific member in the array
    const result = await parties.updateOne(
      { _id: new ObjectId(partyId), "members.uid": uid },
      { $set: { "members.$.isReady": isReady } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Party or member not found" });
    }

    return res.status(200).json({ message: `Ready status set to ${isReady}` });
  } catch (error: any) {
    console.error("[Party Ready] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
