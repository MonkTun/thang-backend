import type { GetServerSideProps } from "next";

import type { PostSummary } from "@/lib/blog/content";
import { SITE_NAME, absoluteUrl, postPath } from "@/lib/blog/site";

/**
 * RSS 2.0 feed of published posts at /blog/feed.xml. Rendered server-side
 * straight to the response (the page component renders nothing) and cached
 * at the CDN for 10 minutes.
 */

const FEED_TITLE = `${SITE_NAME} Blog`;
const FEED_DESCRIPTION =
  "Dev updates, patch notes and stories from the team building THANG, the 5v5 freeze-tag shooter.";

function escapeXml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date ("Wed, 17 Sep 2026 00:00:00 GMT") from an ISO string or "YYYY-MM-DD". */
function rfc822(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? "" : d.toUTCString();
}

function postDate(p: PostSummary): string {
  return rfc822(p.date) || rfc822(p.publishedAt) || rfc822(p.createdAt);
}

function buildRss(posts: PostSummary[]): string {
  const siteUrl = absoluteUrl("/");
  const feedUrl = absoluteUrl("/blog/feed.xml");
  const blogUrl = absoluteUrl("/blog");
  const newest = posts.map(postDate).find(Boolean) || new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = absoluteUrl(postPath(p.slug));
      const categories = p.tags
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        postDate(p) ? `      <pubDate>${postDate(p)}</pubDate>` : "",
        `      <description>${escapeXml(p.description)}</description>`,
        p.author ? `      <dc:creator>${escapeXml(p.author)}</dc:creator>` : "",
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(FEED_TITLE)}</title>`,
    `    <link>${escapeXml(blogUrl)}</link>`,
    `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${newest}</lastBuildDate>`,
    `    <image>`,
    `      <url>${escapeXml(absoluteUrl("/ThangLogo.png"))}</url>`,
    `      <title>${escapeXml(FEED_TITLE)}</title>`,
    `      <link>${escapeXml(siteUrl)}</link>`,
    `    </image>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let posts: PostSummary[] = [];
  try {
    // Server-only module (node:fs, reads content/blog/posts) — imported here
    // so it never reaches a client bundle. The static pages already fail the
    // build on an unparseable post file, so this is only a runtime safety
    // net: an unreadable file yields an empty (but valid) feed.
    const { listPublishedPosts } = await import("@/lib/blog/content");
    posts = await listPublishedPosts();
  } catch (err) {
    console.error("[blog] feed: listPublishedPosts failed:", err);
  }

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=86400",
  );
  res.write(buildRss(posts));
  res.end();

  return { props: {} };
};

export default function FeedXml() {
  return null;
}
