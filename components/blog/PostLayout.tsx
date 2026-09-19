import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import type { PostSummary } from "@/lib/blog/content";
import { PageRenderer } from "@/components/blog/PageRenderer";

// three.js is only worth downloading on pages that turned the snow on.
const PixelSnow = dynamic(() => import("@/components/PixelSnow"), { ssr: false });

/**
 * Public page = the block canvas and nothing else, so what the designer
 * sees in the editor is exactly what ships (the portfolio model). There is
 * no site header, hero, prev/next or footer around it: a title is a Text
 * block with the "h1" variant, and any nav or footer is a block or a shared
 * mirror on the page. Used by the blog posts (pages/blog/[...slug].tsx), the
 * site pages (pages/[[...slug]].tsx) and the admin draft previews, which
 * pass their sticky `banner`.
 *
 * The one thing drawn outside the canvas is the optional snow layer
 * (`meta.snow`): fixed behind everything, showing through every section
 * that has no opaque background.
 *
 * `tw-reset` scopes the Tailwind preflight the atoms were written against
 * (the editor canvas sits under the same class); `grid-page` is the
 * renderer wrapper from blog.css.
 */
type Props = {
  page: Page;
  /** Tag library — resolves Tags blocks to their colors. */
  tags: TagDef[];
  /** Mirror library — resolves `mirror` block instances. */
  mirrors: MirrorDef[];
  /** Published posts for Post grid blocks; empty when the page has none. */
  posts?: PostSummary[];
  /** Rendered above the canvas (draft-preview bar). */
  banner?: ReactNode;
  /** Site pages: leave the wrapper unpainted so the site's ambient aurora
   *  (body::before in globals.css) glows behind the sections, as it did on
   *  the coded pages. Posts keep their flat background. */
  ambient?: boolean;
};

export function PostLayout({ page, tags, mirrors, posts, banner, ambient }: Props) {
  return (
    <div
      className={`tw-reset min-h-screen text-foreground${ambient ? "" : " bg-background"}`}
    >
      {page.meta.snow && (
        <div className="fx-layer">
          <PixelSnow
            color="#ffffff"
            flakeSize={0.18}
            direction={125}
            brightness={1}
            variant="round"
            style={{ opacity: 0.2 }}
            speed={1.25}
            density={0.2}
          />
        </div>
      )}
      {banner}
      <main className="grid-page">
        <PageRenderer page={page} tags={tags} mirrors={mirrors} posts={posts} />
      </main>
    </div>
  );
}

export default PostLayout;
