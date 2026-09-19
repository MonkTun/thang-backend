import type { GetServerSideProps } from "next";

import type { PostSummary } from "@/lib/blog/content";
import { HOME_SLUG, absoluteUrl, pagePath, postPath } from "@/lib/blog/site";

/**
 * /sitemap.xml — every published site page (content/pages), the coded blog
 * index and every published post. Server-rendered straight to the response;
 * CDN-cached for 10 minutes.
 */

type Entry = {
  loc: string;
  lastmod?: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
};

/** Coded routes worth indexing — the site pages come from content/pages. */
const STATIC_ENTRIES: Entry[] = [
  { loc: "/blog", changefreq: "daily", priority: "0.8" },
];

function escapeXml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoOrEmpty(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function buildSitemap(pages: PostSummary[], posts: PostSummary[]): string {
  const newestPost = posts
    .map((p) => isoOrEmpty(p.updatedAt))
    .filter(Boolean)
    .sort()
    .pop();

  const entries: Entry[] = [
    ...pages.map<Entry>((p) => {
      const isHome = p.slug === HOME_SLUG;
      // The home page lists the latest posts, so it changes whenever one does.
      const lastmod = [isoOrEmpty(p.updatedAt), isHome ? newestPost ?? "" : ""]
        .filter(Boolean)
        .sort()
        .pop();
      return {
        loc: pagePath(p.slug),
        lastmod,
        changefreq: isHome ? "weekly" : "monthly",
        priority: isHome ? "1.0" : "0.5",
      };
    }),
    // The index changes whenever a post does.
    ...STATIC_ENTRIES.map((e) => (e.loc === "/blog" ? { ...e, lastmod: newestPost } : e)),
    ...posts.map<Entry>((p) => ({
      loc: postPath(p.slug),
      lastmod: isoOrEmpty(p.updatedAt) || isoOrEmpty(p.publishedAt),
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const urls = entries
    .map((e) =>
      [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(e.loc))}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let pages: PostSummary[] = [];
  let posts: PostSummary[] = [];
  try {
    // Server-only module (node:fs, reads content/**) — imported here so it
    // never reaches a client bundle. The static pages already fail the build
    // on an unparseable file, so this is only a runtime safety net: an
    // unreadable file still yields the static URLs.
    const { listPublishedPages, listPublishedPosts } = await import("@/lib/blog/content");
    [pages, posts] = await Promise.all([listPublishedPages(), listPublishedPosts()]);
  } catch (err) {
    console.error("[blog] sitemap: reading content failed:", err);
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=86400",
  );
  res.write(buildSitemap(pages, posts));
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
