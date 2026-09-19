import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/blog/admin-auth";
import { ConflictError, isValidSlug, savePage } from "@/lib/blog/content";
import { parseContentKind } from "@/lib/blog/site";

/**
 * POST /api/admin/blog/save { slug, page, kind? } → { ok, page, summary }
 *
 * The editor's Save button. savePage validates the page against pageSchema
 * (a ZodError becomes a 400 whose `detail` the editor surfaces in its
 * toolbar) and rewrites content/blog/posts/<slug>.json — or
 * content/pages/<slug>.json with `kind: "page"`. Publishing to the live
 * site is a separate step: commit the file and push.
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

function zodDetail(err: ZodError): string {
  return err.issues
    .map(
      (i) =>
        (i.path.length ? `${i.path.map(String).join(".")}: ` : "") + i.message
    )
    .join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = readJson(req) as
    | { slug?: unknown; page?: unknown; kind?: unknown }
    | undefined;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!slug || !isValidSlug(slug)) {
    return res.status(400).json({ error: "Invalid slug" });
  }
  if (typeof body?.page !== "object" || body.page === null) {
    return res.status(400).json({ error: "Missing page" });
  }
  const kind = parseContentKind(body.kind);
  if (!kind) return res.status(400).json({ error: "Invalid kind" });

  try {
    const { page, summary } = await savePage(slug, body.page, kind);
    return res.status(200).json({ ok: true, page, summary });
  } catch (err) {
    if (err instanceof ConflictError) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "Page failed validation", detail: zodDetail(err) });
    }
    console.error("[blog/save]", err);
    return res.status(500).json({
      error: "Failed to save",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
