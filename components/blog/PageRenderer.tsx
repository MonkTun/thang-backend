import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import type { PostSummary } from "@/lib/blog/content";
import { SectionRenderer } from "./SectionRenderer";
import { PostsProvider } from "./PostsContext";
import { TagLibraryProvider } from "./TagLibraryContext";
import { MirrorLibraryProvider } from "./MirrorLibraryContext";

type Props = {
  page: Page;
  /** Project-wide tag library (site.json) — resolves Tags-block names to
   *  pill colors. Omitting it renders tags in the accent fallback. */
  tags?: TagDef[];
  /** Mirror library (site.json) — resolves `mirror` instances to the source
   *  block they render. Omitting it renders every instance as nothing. */
  mirrors?: MirrorDef[];
  /** Published posts, newest first — what a Post grid block shows. Only
   *  loaded for pages that use one (`usesPostGrid`). */
  posts?: PostSummary[];
};

/**
 * Walks `page.sections` and renders each as a SectionRenderer. The public
 * site uses this directly; the editor wraps each section in its own frame
 * but reuses SectionRenderer underneath via `renderBlock`.
 */
export function PageRenderer({ page, tags = [], mirrors = [], posts = [] }: Props) {
  return (
    <TagLibraryProvider tags={tags}>
      <MirrorLibraryProvider value={{ mirrors }}>
        <PostsProvider posts={posts}>
          {page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </PostsProvider>
      </MirrorLibraryProvider>
    </TagLibraryProvider>
  );
}
