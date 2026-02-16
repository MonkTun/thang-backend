import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { isGameSessionActive } from "@/lib/matchmaking";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const decodedToken = await admin
      .auth()
      .verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.NEXT_PUBLIC_DB_NAME || "game");
    const user = await db.collection("users").findOne(
      { _id: uid },
      { projection: { activeMatchmakingSession: 1 } }
    );

    const session = user?.activeMatchmakingSession as
      | { gameSessionId: string }
      | undefined;

    if (!session?.gameSessionId) {
      return res.status(200).json({ canRejoin: false });
    }

    const active = await isGameSessionActive(session.gameSessionId);
    return res.status(200).json({ canRejoin: active });
  } catch (error: any) {
    console.error("[Match Rejoin Status] Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
