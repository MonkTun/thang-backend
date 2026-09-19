import type { GetStaticPaths, GetStaticProps } from "next";

import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import type { PostSummary } from "@/lib/blog/content";
import { PageSeo } from "@/lib/blog/seo";
import { HOME_SLUG } from "@/lib/blog/site";
import PostLayout from "@/components/blog/PostLayout";

/**
 * Every site page — "/" and "/<slug>" — rendered from
 * content/pages/<slug>.json (home.json is "/"). An optional catch-all at the
 * root: Next always prefers a coded route, so /login, /profile, /social,
 * /blog/**, /admin/** and /api/** are untouched, and new pages can be
 * created at any other URL from the admin. `RESERVED_PAGE_ROOTS`
 * (lib/blog/site.ts) keeps a page from being created under a coded route.
 *
 * Fully static, exactly like the blog posts: every published page is
 * prerendered at build time and anything else is a 404 (`fallback: false` in
 * the production build; `next dev` uses "blocking" so a page created a
 * moment ago renders on its first request). No ISR — a change reaches
 * production by committing the JSON and pushing. In `next dev` both data
 * functions run on every request, so editor saves show up immediately;
 * drafts are viewed through /admin/pages/preview/<slug>.
 *
 * No try/catch anywhere here on purpose: a page file that fails to parse
 * must fail the build loudly instead of quietly dropping the page.
 */

type Props = {
  slug: string;
  page: Page;
  /** Drives <title>, Open Graph and JSON-LD only — nothing on the page itself. */
  summary: PostSummary;
  tags: TagDef[];
  mirrors: MirrorDef[];
  /** Published posts for a Post grid block; empty when the page has none. */
  posts: PostSummary[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Server-only module (node:fs) — imported inside the data functions only,
  // so it never reaches the client bundle.
  const { listPublishedPages } = await import("@/lib/blog/content");
  const pages = await listPublishedPages();
  return {
    paths: pages.map((p) => ({
      // The optional catch-all matches "/" with an empty segment list.
      params: { slug: p.slug === HOME_SLUG ? [] : p.slug.split("/") },
    })),
    fallback: process.env.NODE_ENV === "development" ? "blocking" : false,
  };
};

export const getStaticProps: GetStaticProps<Props, { slug?: string[] }> = async ({
  params,
}) => {
  const parts = params?.slug ?? [];
  const slug = parts.length === 0 ? HOME_SLUG : parts.join("/");

  // "/home" would be a second copy of "/".
  if (parts.length > 0 && slug === HOME_SLUG) return { notFound: true };

  const { isValidSlug, getPublishedPost, listPublishedPosts, loadSiteConfig, usesPostGrid } =
    await import("@/lib/blog/content");

  // Malformed, missing and still-a-draft are all the same thing to the public.
  if (!isValidSlug(slug)) return { notFound: true };
  const found = await getPublishedPost(slug, "page");
  if (!found) return { notFound: true };

  const site = await loadSiteConfig();
  const posts = usesPostGrid(found.page, site.mirrors) ? await listPublishedPosts() : [];

  return {
    props: {
      slug,
      page: found.page,
      summary: found.summary,
      tags: site.tags,
      mirrors: site.mirrors,
      posts,
    },
  };
};

export default function SitePage({ slug, page, summary, tags, mirrors, posts }: Props) {
  return (
    <>
      <PageSeo slug={slug} summary={summary} />
      <PostLayout page={page} tags={tags} mirrors={mirrors} posts={posts} ambient />
    </>
  );
}
