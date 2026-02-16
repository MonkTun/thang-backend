/**
 * DEV-ONLY: Email/password login for PIE (Play In Editor) dev login.
 * Returns Firebase ID token for use with bootstrap.
 *
 */
import type { NextApiRequest, NextApiResponse } from "next";

const FIREBASE_AUTH_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

type ResponseData =
  | { token: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }



  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "NEXT_PUBLIC_FIREBASE_API_KEY is not configured",
    });
  }

  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Missing email or password",
    });
  }

  try {
    const resp = await fetch(
      `${FIREBASE_AUTH_URL}?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      const msg = data?.error?.message || "Firebase auth failed";
      return res.status(401).json({ error: msg });
    }

    const idToken = data?.idToken;
    if (!idToken) {
      return res.status(500).json({ error: "No token in Firebase response" });
    }

    return res.status(200).json({ token: idToken });
  } catch (error: any) {
    console.error("[DevLogin] Error:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}
