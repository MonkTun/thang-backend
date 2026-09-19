import type { GetStaticPaths, GetStaticProps } from "next";

import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import type { PostSummary } from "@/lib/blog/content";
import { PostSeo } from "@/lib/blog/seo";
import PostLayout from "@/components/blog/PostLayout";

/**
 * Public post page — /blog/<slug>, where the slug may contain "/" folders
 * (hence the catch-all). `pages/blog/feed.xml.tsx` is a sibling static
 * route, which Next resolves before this dynamic one.
 *
 * Fully static, like the portfolio: content is deploy-frozen in production
 * (the editor and its API only exist under `next dev`), so every published
 * post in content/blog/posts is prerendered at build time and anything else
 * is a 404 (`fallback: false` in the production build; `next dev` uses
 * `fallback: "blocking"` so a just-published post renders on its first
 * request instead of tripping the dev server's stale getStaticPaths cache).
 * There is no ISR — a change reaches production by committing the JSON and
 * pushing, which triggers a rebuild. In `next dev` both data functions run
 * on every request, so editor saves show up immediately; drafts are viewed
 * through /admin/blog/preview/<slug>.
 *
 * No try/catch anywhere here on purpose: a post file that fails to parse must
 * fail the build loudly instead of quietly dropping the post.
 */

type Props = {
  page: Page;
  /** Drives <title>, Open Graph and JSON-LD only — nothing on the page itself. */
  summary: PostSummary;
  tags: TagDef[];
  mirrors: MirrorDef[];
  /** Published posts for a Post grid block; empty when the post has none. */
  posts: PostSummary[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Server-only module (node:fs) — imported inside the data functions only,
  // so it never reaches the client bundle.
  const { listPublishedPosts } = await import("@/lib/blog/content");
  const posts = await listPublishedPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug.split("/") } })),
    // Production: every published post is prerendered, anything else is a 404.
    // Dev only: the dev server memoises this list per route (no TTL) and only
    // refreshes it in the background, so a post published a moment ago would
    // 404 on its first load under `fallback: false`. "blocking" lets dev render
    // on demand; getStaticProps still returns notFound for drafts/missing slugs.
    fallback: process.env.NODE_ENV === "development" ? "blocking" : false,
  };
};

export const getStaticProps: GetStaticProps<Props, { slug: string[] }> = async ({
  params,
}) => {
  const parts = params?.slug;
  const slug = Array.isArray(parts) ? parts.join("/") : String(parts ?? "");

  const { isValidSlug, getPublishedPost, listPublishedPosts, loadSiteConfig, usesPostGrid } =
    await import("@/lib/blog/content");

  // Malformed, missing and still-a-draft are all the same thing to the public.
  if (!isValidSlug(slug)) return { notFound: true };
  const post = await getPublishedPost(slug);
  if (!post) return { notFound: true };

  const site = await loadSiteConfig();
  const posts = usesPostGrid(post.page, site.mirrors) ? await listPublishedPosts() : [];

  return {
    props: {
      page: post.page,
      summary: post.summary,
      tags: site.tags,
      mirrors: site.mirrors,
      posts,
    },
  };
};

/**
 * The page IS the block canvas — no site header, hero, prev/next or footer —
 * so what the designer sees in the editor is exactly what ships. Any nav or
 * title is a block (or a shared mirror) on the page.
 */
export default function BlogPostPage({ page, summary, tags, mirrors, posts }: Props) {
  return (
    <>
      <PostSeo summary={summary} page={page} />
      <PostLayout page={page} tags={tags} mirrors={mirrors} posts={posts} />
    </>
  );
}
