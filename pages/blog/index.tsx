import type { GetStaticProps } from "next";
import Link from "next/link";

import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";
import BlogCard from "@/components/blog/BlogCard";
import { BlogSeo } from "@/lib/blog/seo";
import type { PostSummary } from "@/lib/blog/content";

type Props = {
  posts: PostSummary[];
};

// Fully static: every published post is read from content/blog/posts/**/*.json
// at build time (and on every request in `next dev`, so editor saves show up
// immediately). No ISR — a change reaches production by committing the JSON
// and pushing, which triggers a rebuild. No try/catch on purpose: a post file
// that fails to parse must fail the build loudly, never render an empty page.
export const getStaticProps: GetStaticProps<Props> = async () => {
  // Server-only module (node:fs). Imported here, never at component level,
  // so it stays out of the client bundle.
  const { listPublishedPosts } = await import("@/lib/blog/content");
  const posts = await listPublishedPosts();
  return { props: { posts } };
};

export default function BlogIndexPage({ posts }: Props) {
  return (
    <div className="post-page">
      <BlogSeo posts={posts} />

      <div className="fx-layer">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.18}
          speed={1.25}
          density={0.2}
          direction={125}
          brightness={1}
          variant="round"
          style={{ opacity: 0.17 }}
        />
      </div>

      <header className="post-topbar">
        <div className="post-topbar__inner">
          <Link href="/" className="post-topbar__back">
            ← Home
          </Link>
          <Link href="/" className="post-topbar__brand" aria-label="THANG home">
            THANG
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Blog</p>
            {/* The page's <h1>, styled like every other section heading. */}
            <h1 className="h2">Notes from the Oven</h1>
            <p className="lead">
              Dev updates, patch notes and stories from the team.
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="card-grid">
              {posts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="post-empty card reveal d1">
              <span className="dl-card__icon" aria-hidden>
                ❄
              </span>
              <h2 className="card__title">First post is on its way.</h2>
              <p className="card__text">
                We&apos;re warming up the Oven. Check back soon — or subscribe
                to the feed and let it come to you.
              </p>
              <a href="/blog/feed.xml" className="btn btn-ghost post-empty__cta">
                RSS feed
              </a>
            </div>
          )}
        </div>
      </section>

      <FooterNav />
    </div>
  );
}
