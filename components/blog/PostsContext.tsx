"use client";

import { createContext, useContext } from "react";
import type { PostSummary } from "@/lib/blog/content";

/**
 * Published blog posts, newest first — what the Post grid block renders.
 * The posts are data, not block props: the static routes read them from
 * content/blog/posts at build time (only for pages that use the block, see
 * `usesPostGrid`), and the editor provides the list it loaded from the admin
 * API. Without a provider the block renders its empty state.
 */
const PostsContext = createContext<PostSummary[]>([]);

export function PostsProvider({
  posts,
  children,
}: {
  posts: PostSummary[];
  children: React.ReactNode;
}) {
  return <PostsContext.Provider value={posts}>{children}</PostsContext.Provider>;
}

export function usePosts(): PostSummary[] {
  return useContext(PostsContext);
}
