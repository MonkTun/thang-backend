"use client";

import type { PostGridProps } from "@/lib/blog/schema";
import { BlogCard } from "@/components/blog/BlogCard";
import { useEdit } from "@/components/blog/EditContext";
import { usePosts } from "@/components/blog/PostsContext";

/**
 * The newest published posts as THANG cards — the home page's "Latest from
 * the Oven". Posts come from PostsContext, never from the block's props, so
 * publishing a post updates every grid on the next build. With nothing
 * published it shows the block's empty-state card instead.
 */
export function PostGrid({ count, emptyTitle, emptyText }: PostGridProps) {
  const inEditor = useEdit() !== null;
  const all = usePosts();
  const posts = count > 0 ? all.slice(0, count) : all;

  if (posts.length === 0) {
    return (
      <div className="post-empty card reveal d1">
        <span className="dl-card__icon" aria-hidden>
          ❄
        </span>
        <h3 className="card__title">{emptyTitle}</h3>
        <p className="card__text">{emptyText}</p>
      </div>
    );
  }

  return (
    // In the editor a click selects the block — it must not follow a card.
    <div className="card-grid" style={inEditor ? { pointerEvents: "none" } : undefined}>
      {posts.map((post, i) => (
        <BlogCard key={post.slug} post={post} index={i} />
      ))}
    </div>
  );
}
