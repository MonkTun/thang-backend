// Canonical origin for SEO tags (lib/blog/site.ts). Baked into BOTH bundles
// here because Next only inlines NEXT_PUBLIC_* / config.env values into the
// client: without this, the Vercel fallback would be server-only and
// next/head would rewrite canonical/og/JSON-LD to localhost on hydration.
// Evaluated once at startup: restart `next dev` after changing the variable.
const siteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}`
    : "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  // Site pages and blog posts are plain JSON in content/ (see
  // lib/blog/content.ts). The static pages read it at build time, but
  // /blog/feed.xml and /sitemap.xml are server-rendered on every request, so
  // their serverless functions need the files traced into the deployment
  // bundle on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // The content admin is the only admin surface in use; /admin lands on its
  // list of pages and posts (/admin/blog). Portfolio-style shortcut: append
  // /edit to any page or post URL to open it in the editor — bare /edit is
  // the home page, /blog/edit the list. Order matters: the blog rules must
  // win over the generic page rule. In production the admin routes are
  // 404s, so the redirects are harmless there.
  async redirects() {
    return [
      { source: "/admin", destination: "/admin/blog", permanent: false },
      { source: "/admin/pages", destination: "/admin/blog", permanent: false },
      { source: "/edit", destination: "/admin/pages/edit/home", permanent: false },
      { source: "/blog/edit", destination: "/admin/blog", permanent: false },
      {
        source: "/blog/:slug+/edit",
        destination: "/admin/blog/edit/:slug+",
        permanent: false,
      },
      {
        // Any site page. /admin/** and /api/** keep their own URLs.
        source: "/:first((?!(?:admin|api|_next)(?:/|$))[^/]+)/:rest*/edit",
        destination: "/admin/pages/edit/:first/:rest*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
