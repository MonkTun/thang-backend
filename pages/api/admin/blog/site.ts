import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/blog/admin-auth";
import { loadSiteConfig, patchSiteConfig } from "@/lib/blog/content";

/**
 * /api/admin/blog/site — the shared tag + mirror libraries
 * (content/blog/site.json).
 *   GET  → SiteConfig
 *   POST partial { tags?, mirrors? } → { ok, config }
 *
 * The editor debounce-saves one library at a time (and both at once from a
 * mirrored Tags block), so POST patches only the keys it receives:
 * patchSiteConfig reads site.json, overlays the provided keys and writes
 * it back, leaving the other library untouched.
 */

function readJson(req: NextApiRequest): unknown {
  const body = req.body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return undefined;
    }
  }
  return body;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAdmin(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const config = await loadSiteConfig();
      return res.status(200).json(config);
    }

    if (req.method === "POST") {
      const body = readJson(req);
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
      // Only the two library fields are patchable; anything else in the
      // body is ignored rather than rejected so older clients keep working.
      const config = await patchSiteConfig(body);
      return res.status(200).json({ ok: true, config });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid site config",
        detail: err.issues
          .map(
            (i) =>
              (i.path.length ? `${i.path.map(String).join(".")}: ` : "") +
              i.message
          )
          .join("; "),
      });
    }
    console.error("[blog/site]", err);
    return res.status(500).json({
      error: "Failed to save",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
