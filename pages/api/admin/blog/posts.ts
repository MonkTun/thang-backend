import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { requireAdmin } from "@/lib/blog/admin-auth";
import {
  ConflictError,
  NotFoundError,
  createPage,
  deletePage,
  isValidSlug,
  listPages,
  listPosts,
} from "@/lib/blog/content";
import { parseContentKind } from "@/lib/blog/site";

/**
 * /api/admin/blog/posts
 *   GET    → { posts: PostSummary[], pages: PostSummary[] }   drafts included
 *   POST   { slug, title?, kind? } → { ok, slug }   create a blank post/page (409 if taken)
 *   DELETE { slug, kind? }         → { ok: true }   remove its JSON file
 *
 * `kind` is "post" (default, content/blog/posts) or "page" (content/pages).
 * In `next dev` the public pages re-run getStaticProps per request, so a
 * delete shows up right away without any cache invalidation.
 */

const slugField = z
  .string()
  .min(1)
  .max(120)
  .refine(isValidSlug, {
    message:
      "Slug must be lowercase letters, digits and dashes; use / to file a post under a folder.",
  });

const kindField = z
  .unknown()
  .transform((value) => parseContentKind(value))
  .refine((kind) => kind !== null, { message: 'kind must be "post" or "page".' })
  .transform((kind) => kind ?? "post");

const createBody = z.object({
  slug: slugField,
  title: z.string().max(200).optional(),
  kind: kindField,
});

const deleteBody = z.object({ slug: slugField, kind: kindField });

// Next parses JSON bodies when Content-Type is application/json; anything
// else arrives as a string, so parse defensively.
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

function fail(res: NextApiResponse, err: unknown) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "Invalid request body", detail: zodDetail(err) });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message || "Post not found" });
  }
  if (err instanceof ConflictError) {
    return res
      .status(409)
      .json({ error: err.message || "A post with that slug already exists." });
  }
  console.error("[blog/posts]", err);
  return res.status(500).json({
    error: "Internal server error",
    detail: err instanceof Error ? err.message : String(err),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAdmin(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const [posts, pages] = await Promise.all([listPosts(), listPages()]);
      return res.status(200).json({ posts, pages });
    }

    if (req.method === "POST") {
      const body = createBody.parse(readJson(req));
      const title = body.title?.trim() || body.slug;
      await createPage(body.slug, title, body.kind);
      return res.status(200).json({ ok: true, slug: body.slug });
    }

    if (req.method === "DELETE") {
      const body = deleteBody.parse(readJson(req));
      const removed = await deletePage(body.slug, body.kind);
      if (!removed) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return fail(res, err);
  }
}
