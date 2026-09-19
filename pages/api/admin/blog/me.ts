import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/blog/admin-auth";

/**
 * GET /api/admin/blog/me → { uid, email }
 *
 * The local editor's identity. There is no login: the whole admin surface
 * exists only under `next dev` (see lib/blog/admin-auth.ts), so this
 * answers with LOCAL_ADMIN in development and a 404 everywhere else —
 * requireAdmin writes that 404 itself.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({ uid: user.uid, email: user.email });
}
