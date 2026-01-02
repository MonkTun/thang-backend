import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import { getOrCreateUser, User } from "@/lib/userUtils";

type ResponseData =
  | {
      user: User;
      serverTime: string;
      config: {
        version: string;
        maintenance: boolean;
      };
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract and validate Firebase token
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    // Verify Firebase ID token
    let decoded;
    try {
      console.log("[Bootstrap] Verifying Firebase token...");
      decoded = await admin.auth().verifyIdToken(token);
      console.log("[Bootstrap] Token verified for UID:", decoded.uid);
    } catch (error: any) {
      console.error("[Bootstrap] Firebase verification error:", error.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const uid = decoded.uid;
    const email = decoded.email || "";

    if (!uid) {
      return res.status(401).json({ error: "Invalid token: missing uid" });
    }

    console.log("[Bootstrap] Getting or creating user:", uid);
    const user = await getOrCreateUser(uid, email);
    console.log("[Bootstrap] User retrieved successfully");

    // Return richer payload for both Web and Game clients
    return res.status(200).json({
      user,
      serverTime: new Date().toISOString(),
      config: {
        version: "1.0.0",
        maintenance: false,
      },
    });
  } catch (error) {
    console.error(
      "[Bootstrap] CRITICAL ERROR:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error) {
      console.error("[Bootstrap] Stack:", error.stack);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
