/**
 * Site constants shared by SEO tags, the feed/sitemap and the blog UI.
 * Isomorphic — no server-only imports — so components can use it too.
 */

export const SITE_NAME = "THANG";

export const SITE_DESCRIPTION =
  "THANG is a 5v5 freeze-tag shooter. Freeze the entire opposing team to win — and if you stop moving, you freeze too.";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Canonical origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL in
 * production. next.config.js also derives it from VERCEL_PROJECT_PRODUCTION_URL
 * at build time and inlines it into both bundles — it must be identical on the
 * server and in the browser, because next/head re-emits every tag on
 * hydration and would otherwise replace the SSR values.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    return `https://${stripTrailingSlash(vercel.replace(/^https?:\/\//i, ""))}`;
  }
  // Last resort in the browser: the page's own origin beats "localhost".
  if (typeof window !== "undefined" && window.location?.origin) {
    return stripTrailingSlash(window.location.origin);
  }
  return "http://localhost:3000";
}

export const SITE_URL: string = resolveSiteUrl();

/** Absolute URL for a site path. Already-absolute URLs pass through. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function postPath(slug: string): string {
  return `/blog/${slug}`;
}

/**
 * The two content collections. A "post" is a blog post
 * (content/blog/posts/<slug>.json → /blog/<slug>); a "page" is a site page
 * (content/pages/<slug>.json → /<slug>). Same schema, same editor.
 */
export type ContentKind = "post" | "page";

export function isContentKind(value: unknown): value is ContentKind {
  return value === "post" || value === "page";
}

/** `kind` as sent to the admin API: absent means "post" (the original
 *  behaviour), anything unknown is null so the route can answer 400. */
export function parseContentKind(value: unknown): ContentKind | null {
  if (value === undefined || value === null || value === "") return "post";
  return isContentKind(value) ? value : null;
}

/** The page file that renders at "/". */
export const HOME_SLUG = "home";

/** Public path of a site page: "home" → "/", "download" → "/download". */
export function pagePath(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}

export function publicPath(kind: ContentKind, slug: string): string {
  return kind === "page" ? pagePath(slug) : postPath(slug);
}

/**
 * First URL segments owned by coded routes (pages/*.tsx, /api, static
 * folders in public/). A site page can't live under any of them — the coded
 * route would win and the page would never render. Keep in sync with
 * `pages/` when a coded route is added.
 */
export const RESERVED_PAGE_ROOTS: readonly string[] = [
  "admin",
  "api",
  "blog",
  "edit",
  "invite",
  "login",
  "privacy",
  "profile",
  "social",
  "uploads",
  "verify",
];

/** Why `slug` can't be a site page, or null when it can. Shared by the
 *  server (lib/blog/content.ts) and the admin's new-page form. */
export function pageSlugProblem(slug: string): string | null {
  const segments = slug.split("/");
  if (RESERVED_PAGE_ROOTS.includes(segments[0])) {
    return `"/${segments[0]}" belongs to a built-in route.`;
  }
  // <url>/edit is the editor shortcut (next.config.js), so a page ending in
  // /edit could never be opened.
  if (segments[segments.length - 1] === "edit") {
    return `A page URL can't end in "/edit" — that opens the editor.`;
  }
  return null;
}

function encodeSlug(slug: string): string {
  return slug.split("/").map(encodeURIComponent).join("/");
}

/** Editor URL for a post or page (dev only). */
export function editorPath(kind: ContentKind, slug: string): string {
  return `/admin/${kind === "page" ? "pages" : "blog"}/edit/${encodeSlug(slug)}`;
}

/** Draft-preview URL for a post or page (dev only). */
export function previewPath(kind: ContentKind, slug: string): string {
  return `/admin/${kind === "page" ? "pages" : "blog"}/preview/${encodeSlug(slug)}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * "2026-09-17" → "Sep 17, 2026"; "" → "". Parsed by hand so the output is
 * identical on the server and in the browser (no Intl / timezone drift,
 * which would otherwise trip hydration). Anything that isn't a date-only
 * string is returned as typed.
 */
export function formatPostDate(date: string): string {
  if (!date) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
  if (!m) return date;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return date;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
