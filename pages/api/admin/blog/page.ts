import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/blog/admin-auth";
import { NotFoundError, isValidSlug, loadPost } from "@/lib/blog/content";
import { parseContentKind } from "@/lib/blog/site";

/**
 * GET /api/admin/blog/page?slug=<slug>[&kind=page] → { slug, kind, page, summary }
 *
 * Full document for the editor and the draft preview, read from
 * content/blog/posts/<slug>.json, or content/pages/<slug>.json with
 * `kind=page`. Drafts included — the public site reads through
 * getPublishedPost instead.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = req.query.slug;
  const slug = Array.isArray(raw) ? raw.join("/") : raw ?? "";
  if (!slug || !isValidSlug(slug)) {
    return res.status(400).json({ error: "Invalid slug" });
  }
  const kind = parseContentKind(req.query.kind);
  if (!kind) return res.status(400).json({ error: "Invalid kind" });

  try {
    const { page, summary } = await loadPost(slug, kind);
    return res.status(200).json({ slug, kind, page, summary });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    console.error("[blog/page]", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
