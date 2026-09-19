import { promises as fs } from "node:fs";
import path from "node:path";

/* ============================================================
   Blog media on disk — SERVER ONLY (node:fs).

   Uploads land in `public/uploads/blog/<folder>/` and are served by Next as
   `/uploads/blog/<folder>/<name>`. They are committed to git like the
   portfolio's `public/uploads`, so publishing a post also publishes its
   media with the same `git push`. Names are `<stem>-<base36 stamp><ext>`:
   unique per upload, so they can be cached forever.
   ============================================================ */

export type MediaFolder = "images" | "videos";

export const MEDIA_FOLDERS: readonly MediaFolder[] = ["images", "videos"];

export function isMediaFolder(value: unknown): value is MediaFolder {
  return value === "images" || value === "videos";
}

export type StoredFile = {
  /** Public URL, e.g. "/uploads/blog/images/hero-lx4k2a.webp". */
  url: string;
  /** Same public path (kept for API compatibility with the old object path). */
  path: string;
  /** File basename. */
  name: string;
  size: number;
  contentType: string;
  /** ISO string. */
  uploadedAt: string;
};

export const IMAGE_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export const VIDEO_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

/** Extension for a content type when the client's file name has none. */
const EXT_BY_CONTENT_TYPE: Readonly<Record<string, string>> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

/** Reverse map for the library listing (git has no content-type metadata). */
const CONTENT_TYPE_BY_EXT: Readonly<Record<string, string>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "blog");
const URL_PREFIX = "/uploads/blog";

/** Media type without parameters, lowercased ("image/jpeg; charset=…" → "image/jpeg"). */
function mediaType(ct: string | undefined | null): string {
  return (ct || "").split(";")[0].trim().toLowerCase();
}

/** `ct` may carry parameters — only the media type is compared. */
export function isAllowedContentType(
  ct: string | undefined | null,
  folder: MediaFolder
): boolean {
  const base = mediaType(ct);
  if (!base) return false;
  return (folder === "images" ? IMAGE_CONTENT_TYPES : VIDEO_CONTENT_TYPES).has(base);
}

/**
 * Kebab-case stem (≤ 60 chars) + lowercase extension WITH its dot ("" when
 * the name has none). Path separators and anything non-alphanumeric are
 * stripped so a client-supplied name can't escape the folder.
 */
export function safeObjectName(original: string): { stem: string; ext: string } {
  const base = (original || "").split(/[\\/]/).pop() || "";
  const dot = base.lastIndexOf(".");
  const rawStem = dot > 0 ? base.slice(0, dot) : base;
  const rawExt = dot > 0 ? base.slice(dot + 1) : "";

  const stem =
    rawStem
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "file";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  return { stem, ext: ext ? `.${ext}` : "" };
}

function folderDir(folder: MediaFolder): string {
  if (!isMediaFolder(folder)) throw new Error(`Invalid media folder: ${String(folder)}`);
  return path.join(UPLOAD_ROOT, folder);
}

/** Absolute path for a file name inside a folder, re-checked to stay under
 *  public/uploads/blog even though the name is already sanitised. */
function uploadPath(folder: MediaFolder, name: string): string {
  const dir = folderDir(folder);
  const file = path.resolve(dir, name);
  if (!file.startsWith(dir + path.sep)) throw new Error(`Invalid upload name: ${name}`);
  return file;
}

function publicUrl(folder: MediaFolder, name: string): string {
  return `${URL_PREFIX}/${folder}/${name}`;
}

/**
 * Write an uploaded buffer to `public/uploads/blog/<folder>/` as
 * `<stem>-<base36 stamp><ext>` (mkdir -p). The extension comes from the
 * name only when it maps to a type allowed for the folder, otherwise from
 * the (validated) content type; throws when neither yields one, so no
 * foreign-extension or extension-less files ever land in public/. Never
 * overwrites: a same-millisecond collision gets a numeric suffix.
 */
export async function saveUpload(
  buf: Buffer,
  opts: { name: string; contentType: string; folder: MediaFolder }
): Promise<StoredFile> {
  const dir = folderDir(opts.folder);
  const { stem, ext: nameExt } = safeObjectName(opts.name);
  // Keep the client's extension only when it names a type allowed for this
  // folder (the portfolio's ALLOWED_EXT gate); otherwise (".html", ".js",
  // ".2final", "") derive it from the already-validated Content-Type.
  // nameExt is "" or "." + [a-z0-9]{1,10}, so the plain index can never hit
  // an Object.prototype key.
  const allowed =
    opts.folder === "images" ? IMAGE_CONTENT_TYPES : VIDEO_CONTENT_TYPES;
  const typeFromName = nameExt ? CONTENT_TYPE_BY_EXT[nameExt] : undefined;
  const ext =
    typeFromName && allowed.has(typeFromName)
      ? nameExt
      : EXT_BY_CONTENT_TYPE[mediaType(opts.contentType)] || "";
  if (!ext) {
    throw new Error(
      `Unsupported content type for ${opts.folder}: ${opts.contentType || "(none)"}`
    );
  }
  const stamp = Date.now().toString(36);

  await fs.mkdir(dir, { recursive: true });

  let name = `${stem}-${stamp}${ext}`;
  for (let attempt = 2; ; attempt++) {
    try {
      await fs.writeFile(uploadPath(opts.folder, name), buf, { flag: "wx" });
      break;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST" || attempt > 50) throw err;
      name = `${stem}-${stamp}-${attempt}${ext}`;
    }
  }

  const url = publicUrl(opts.folder, name);
  return {
    url,
    path: url,
    name,
    size: buf.length,
    contentType: opts.contentType,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Every file in `public/uploads/blog/<folder>/`, newest first by mtime.
 * `[]` when the folder doesn't exist yet. Dot-files (.DS_Store) and
 * sub-directories are ignored.
 */
export async function listUploads(folder: MediaFolder): Promise<StoredFile[]> {
  const dir = folderDir(folder);
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map(async (entry): Promise<StoredFile & { mtimeMs: number }> => {
        const stat = await fs.stat(path.join(dir, entry.name));
        const url = publicUrl(folder, entry.name);
        return {
          url,
          path: url,
          name: entry.name,
          size: stat.size,
          contentType: CONTENT_TYPE_BY_EXT[path.extname(entry.name).toLowerCase()] || "",
          uploadedAt: stat.mtime.toISOString(),
          mtimeMs: stat.mtimeMs,
        };
      })
  );

  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files.map(({ mtimeMs: _mtime, ...file }) => file);
}
