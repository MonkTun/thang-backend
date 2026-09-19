import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/blog/admin-auth";
import { listUploads, type MediaFolder } from "@/lib/blog/uploads-store";

/**
 * GET /api/admin/blog/uploads?folder=images|videos (default images)
 *   → { items: { src, name, size, mtime }[] }
 *
 * The editor's media library (PropertiesPanel → ImageLibrary), read from
 * public/uploads/blog/<folder>. Shape matches the portfolio's version so
 * the picker didn't need to change: `src` is the public path
 * (`/uploads/blog/<folder>/<name>`), `mtime` epoch millis, newest first.
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

  const folderRaw = req.query.folder;
  const folderParam =
    (Array.isArray(folderRaw) ? folderRaw[0] : folderRaw) || "images";
  if (folderParam !== "images" && folderParam !== "videos") {
    return res.status(400).json({ error: "folder must be images or videos" });
  }
  const folder: MediaFolder = folderParam;

  try {
    const files = await listUploads(folder);
    const items = files.map((f) => ({
      src: f.url,
      name: f.name,
      size: f.size,
      mtime: Date.parse(f.uploadedAt) || 0,
    }));
    return res.status(200).json({ items });
  } catch (err) {
    console.error("[blog/uploads]", err);
    return res.status(500).json({
      error: "Failed to read the media library",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
