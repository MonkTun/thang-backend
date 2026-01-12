import type { NextApiRequest, NextApiResponse } from "next";
import { pollMatchmakingQueueOnce } from "@/lib/sqsListener";
import admin from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: Add Admin Authorization here
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // For now, allow unauthorized access strictly for local dev/demo based on prompt "make a nice /admin page"
    // In prod, uncomment:
    // return res.status(401).json({ error: "Missing authorization header" });
  }

  try {
    const { events, logs } = await pollMatchmakingQueueOnce();
    return res.status(200).json({ events, logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
