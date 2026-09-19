import { downscaleImage } from "@/lib/blog/downscale-image";
import { adminFetch } from "@/lib/blog/admin-client";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_MB,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_MB,
} from "@/lib/blog/upload-limits";

/**
 * Shared client-side upload path — BROWSER ONLY. Images are downscaled /
 * re-encoded in the browser first, then everything is POSTed as a raw body
 * to /api/admin/blog/upload, which writes it into public/uploads/blog/
 * (committed with the post). Every function throws with a readable
 * message on failure.
 *
 * Used by the properties-panel uploaders and canvas image paste — keep
 * them all on this one path so they can't drift.
 */

/** Client copy of the server's StoredFile (lib/blog/uploads-store.ts) —
 *  kept separate so this module never pulls node:fs into the bundle. */
export type StoredFile = {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};

export type MediaFolder = "images" | "videos";

type ErrorPayload = { error?: string; detail?: string };

function mb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

async function readPayload<T>(res: Response): Promise<{ payload: T | null; text: string }> {
  const text = await res.text();
  try {
    return { payload: text ? (JSON.parse(text) as T) : null, text };
  } catch {
    // Non-JSON response — keep `text` for the error message.
    return { payload: null, text };
  }
}

function failureMessage(
  what: string,
  res: Response,
  payload: ErrorPayload | null,
  text: string
): string {
  if (payload?.error) {
    return payload.detail ? `${payload.error} — ${payload.detail}` : payload.error;
  }
  return `${what} failed (${res.status}${text ? `: ${text.slice(0, 120)}` : ""})`;
}

/**
 * Upload one file into `public/uploads/blog/<folder>/` and return the
 * stored record (`.url` is the public path, e.g. "/uploads/blog/images/…").
 */
export async function uploadMedia(file: File, folder: MediaFolder): Promise<StoredFile> {
  const contentType = file.type || "application/octet-stream";
  const res = await adminFetch(
    `/api/admin/blog/upload?name=${encodeURIComponent(file.name)}&folder=${folder}`,
    {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: file,
    }
  );
  const { payload, text } = await readPayload<ErrorPayload & Partial<StoredFile>>(res);
  if (!res.ok || !payload?.url) {
    throw new Error(failureMessage("Upload", res, payload, text));
  }
  return payload as StoredFile;
}

/** Downscale, cap, upload — returns the public image URL. */
export async function uploadImageFile(rawFile: File): Promise<string> {
  const file = await downscaleImage(rawFile);
  if (!file.type.startsWith("image/")) {
    throw new Error(`Not an image: ${file.name || file.type || "unknown file"}.`);
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error(
      `File too large: ${mb(file.size)} MB (max ${IMAGE_MAX_MB} MB). ` +
        (file.type === "image/gif"
          ? "GIFs can't be compressed in-browser — trim it or convert to video."
          : "")
    );
  }
  return (await uploadMedia(file, "images")).url;
}

/** video/* only, capped at VIDEO_MAX_BYTES — returns the public video URL. */
export async function uploadVideoFile(rawFile: File): Promise<string> {
  if (!rawFile.type.startsWith("video/")) {
    throw new Error(`Not a video: ${rawFile.name || rawFile.type || "unknown file"}.`);
  }
  if (rawFile.size > VIDEO_MAX_BYTES) {
    throw new Error(
      `Video too large: ${mb(rawFile.size)} MB (max ${VIDEO_MAX_MB} MB). ` +
        "Compress it (H.264 MP4) or embed it from YouTube instead."
    );
  }
  return (await uploadMedia(rawFile, "videos")).url;
}
