/**
 * Upload size caps shared by the browser preflight (upload-image.ts) and
 * the /api/admin/blog/upload route — one place, so they can't drift apart.
 *
 * Uploads are committed to the git repo (public/uploads/blog), not pushed
 * to a CDN, so the caps are deliberately modest. Images are downscaled /
 * re-encoded in the browser first (downscale-image.ts), so IMAGE_MAX_BYTES
 * is mostly a backstop for animated GIFs, which have no in-browser encoder
 * and arrive at full size. Videos are never re-encoded — prefer a YouTube
 * embed for anything long.
 */
export const IMAGE_MAX_BYTES = 12 * 1024 * 1024;

export const VIDEO_MAX_BYTES = 64 * 1024 * 1024;

export const IMAGE_MAX_MB = Math.round(IMAGE_MAX_BYTES / (1024 * 1024));

export const VIDEO_MAX_MB = Math.round(VIDEO_MAX_BYTES / (1024 * 1024));
