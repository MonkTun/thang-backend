import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { requireAdmin } from "@/lib/blog/admin-auth";
import {
  ConflictError,
  NotFoundError,
  duplicatePage,
  isValidSlug,
} from "@/lib/blog/content";
import { parseContentKind } from "@/lib/blog/site";

/**
 * POST /api/admin/blog/duplicate { source, target?, kind? } → { ok, slug }
 *
 * Clones a post (or a site page with `kind: "page"`). Without `target` the copy lands at "<source>-copy"
 * (then -copy-2, …); the copy is always an unpublished draft titled
 * "… (copy)" — see duplicatePage in lib/blog/content.ts.
 */

const slugField = z
  .string()
  .min(1)
  .max(120)
  .refine(isValidSlug, { message: "Invalid slug." });

const bodySchema = z.object({
  /** Slug of the post to clone. */
  source: slugField,
  /** Optional explicit destination slug — 409 if it already exists. */
  target: slugField.optional(),
  kind: z.unknown().optional(),
});

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

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(readJson(req));
  } catch (err) {
    return res.status(400).json({
      error: "Invalid request body",
      detail:
        err instanceof ZodError
          ? err.issues.map((i) => i.message).join("; ")
          : String(err),
    });
  }

  const kind = parseContentKind(body.kind);
  if (!kind) return res.status(400).json({ error: "Invalid kind" });

  try {
    const slug = await duplicatePage(body.source, body.target, kind);
    return res.status(200).json({ ok: true, slug });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res
        .status(404)
        .json({ error: `Source "${body.source}" not found` });
    }
    if (err instanceof ConflictError) {
      return res
        .status(409)
        .json({ error: err.message || `Target "${body.target}" already exists.` });
    }
    console.error("[blog/duplicate]", err);
    return res.status(500).json({
      error: "Failed to duplicate",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
