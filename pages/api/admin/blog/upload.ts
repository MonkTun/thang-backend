import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/blog/admin-auth";
import {
  isAllowedContentType,
  saveUpload,
  type MediaFolder,
} from "@/lib/blog/uploads-store";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_MB,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_MB,
} from "@/lib/blog/upload-limits";

/**
 * POST /api/admin/blog/upload?name=<file name>&folder=images|videos
 *   body: the raw file bytes, `Content-Type` = the file's MIME type
 *   → StoredFile { url, path, name, size, contentType, uploadedAt }
 *
 * Writes the file to public/uploads/blog/<folder>/ (the portfolio model):
 * the upload is served at `/uploads/blog/<folder>/<name>` immediately in
 * `next dev`, and reaches the live site when the file is committed and
 * pushed alongside the post. The size cap is per folder (IMAGE_MAX_BYTES /
 * VIDEO_MAX_BYTES) — this is a git repo, not a CDN, so keep videos short
 * and prefer YouTube for anything long.
 */

// Raw body: Next's JSON/urlencoded parser would mangle binary uploads.
export const config = {
  api: { bodyParser: false },
};

class TooLargeError extends Error {}

/**
 * Accumulates the request stream into one Buffer, aborting as soon as the
 * running total passes `cap` so a runaway upload can't eat memory.
 *
 * `destroyOnReturn: false`: leaving a plain `for await (… of req)` early
 * destroys the socket, so the client would see a connection reset instead
 * of the 413. Left intact, Node drains the unread remainder itself once
 * the response has been sent.
 */
async function readRawBody(req: NextApiRequest, cap: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer);
    total += buf.length;
    if (total > cap) throw new TooLargeError();
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function capFor(folder: MediaFolder): { bytes: number; mb: number } {
  return folder === "videos"
    ? { bytes: VIDEO_MAX_BYTES, mb: VIDEO_MAX_MB }
    : { bytes: IMAGE_MAX_BYTES, mb: IMAGE_MAX_MB };
}

function tooLarge(res: NextApiResponse, folder: MediaFolder, size?: number) {
  const mb = size ? ` (${(size / (1024 * 1024)).toFixed(1)} MB)` : "";
  return res.status(413).json({
    error: `File too large${mb} — max ${capFor(folder).mb} MB for ${folder}.`,
  });
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

  const folderRaw = req.query.folder;
  const folderParam =
    (Array.isArray(folderRaw) ? folderRaw[0] : folderRaw) || "images";
  if (folderParam !== "images" && folderParam !== "videos") {
    return res.status(400).json({ error: "folder must be images or videos" });
  }
  const folder: MediaFolder = folderParam;

  const nameRaw = req.query.name;
  const name = (Array.isArray(nameRaw) ? nameRaw[0] : nameRaw) || "upload";

  // "image/jpeg; charset=…" → "image/jpeg"
  const contentType = (req.headers["content-type"] ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!contentType || !isAllowedContentType(contentType, folder)) {
    return res.status(415).json({
      error: `Unsupported content type for ${folder}: ${contentType || "(none)"}`,
    });
  }

  const cap = capFor(folder).bytes;

  // Cheap early exit when the client announced the size up front.
  const declared = Number(req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > cap) {
    req.resume();
    return tooLarge(res, folder, declared);
  }

  let buf: Buffer;
  try {
    buf = await readRawBody(req, cap);
  } catch (err) {
    if (err instanceof TooLargeError) return tooLarge(res, folder);
    return res.status(400).json({
      error: "Failed to read upload",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
  if (buf.length === 0) {
    return res.status(400).json({ error: "Empty upload" });
  }

  try {
    const stored = await saveUpload(buf, { name, contentType, folder });
    return res.status(200).json(stored);
  } catch (err) {
    console.error("[blog/upload]", err);
    return res.status(500).json({
      error: "Upload failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
