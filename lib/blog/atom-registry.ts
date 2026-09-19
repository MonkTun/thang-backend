import type { ComponentType } from "react";
import type { Block, BlockType, SourceBlockType } from "@/lib/blog/schema";
import { CAROUSEL_ITEM_EFFECT_DEFAULTS } from "@/lib/blog/schema";

import { Text } from "@/components/blog/atoms/Text";
import { Image } from "@/components/blog/atoms/Image";
import { Button } from "@/components/blog/atoms/Button";
import { Spacer } from "@/components/blog/atoms/Spacer";
import { Line } from "@/components/blog/atoms/Line";
import { Quote } from "@/components/blog/atoms/Quote";
import { Video } from "@/components/blog/atoms/Video";
import { ProjectCarousel } from "@/components/blog/atoms/ProjectCarousel";
import { ProjectGrid } from "@/components/blog/atoms/ProjectGrid";
import { SocialLinks } from "@/components/blog/atoms/SocialLinks";
import { Tags } from "@/components/blog/atoms/Tags";
import { Mirror } from "@/components/blog/atoms/Mirror";
import { PostList } from "@/components/blog/atoms/PostList";
import { HeroTitle } from "@/components/blog/atoms/HeroTitle";
import { PostGrid } from "@/components/blog/atoms/PostGrid";
import { Cards } from "@/components/blog/atoms/Cards";
import { Footer } from "@/components/blog/atoms/Footer";
import { FontSpecimen } from "@/components/blog/atoms/FontSpecimen";
import { Swatches } from "@/components/blog/atoms/Swatches";

type AtomEntry<P = unknown> = {
  type: BlockType;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /** Default props applied when this atom is added via "+ Add block". */
  defaultProps: P;
  /** Default size when newly inserted: `colSpan` in columns, `rowSpan` in
   *  ROW_HEIGHT_PX rows (lib/grid.ts). If ROWS_PER_MODULE is ever raised above
   *  1, these have to be whole modules too — otherwise a freshly added block
   *  jumps the first time it's dragged. */
  defaultLayout: { colSpan: number; rowSpan: number };
  /** Mobile prop overrides seeded when the block is added (keys must be in
   *  MOBILE_OVERRIDABLE_KEYS for the type). For blocks whose desktop default
   *  is wrong on a phone — a 3-column grid should land as 1 column. */
  defaultMobileProps?: Record<string, unknown>;
  /**
   * The block's height comes from its content, not from its grid box: copy
   * that reflows with the viewport, a post grid whose length depends on how
   * many posts are published, cards that stack on a phone. On the public
   * page such a block may push its rows taller than `rowSpan` (everything
   * below moves down) instead of spilling over the next block; `rowSpan` is
   * its minimum. Everything else — media above all — is locked to its box.
   * See `blockSizingStyle` in SectionRenderer.
   */
  grows?: boolean;
};

/**
 * Single source of truth for atomic blocks. Both the public renderer and
 * the editor consume this map. To add a new block type:
 *   1. Define a schema variant in `lib/schema.ts`
 *   2. Implement the component in `components/atoms/`
 *   3. Register here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const atomRegistry: Record<BlockType, AtomEntry<any>> = {
  text: {
    type: "text",
    grows: true,
    label: "Text",
    component: Text,
    defaultProps: {
      content: "Type something",
      variant: "body",
      align: "left",
      color: "foreground",
    },
    defaultLayout: { colSpan: 12, rowSpan: 3 },
  },
  image: {
    type: "image",
    label: "Image",
    component: Image,
    defaultProps: {
      src: "",
      alt: "",
      fit: "cover",
      radius: 0,
      filter: "none",
      focalX: 50,
      focalY: 50,
      rotate: 0,
      flipX: false,
      flipY: false,
      blur: 0,
      zoom: 1,
      tint: "none",
      tintOpacity: 0,
    },
    defaultLayout: { colSpan: 6, rowSpan: 15 },
  },
  button: {
    type: "button",
    label: "Button",
    component: Button,
    defaultProps: {
      label: "Click me",
      href: "#",
      variant: "primary",
      align: "left",
    },
    defaultLayout: { colSpan: 4, rowSpan: 3 },
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    component: Spacer,
    defaultProps: { height: 48 },
    defaultLayout: { colSpan: 12, rowSpan: 3 },
  },
  line: {
    type: "line",
    label: "Line",
    component: Line,
    defaultProps: { thickness: 1, color: "border" },
    defaultLayout: { colSpan: 12, rowSpan: 1 },
  },
  quote: {
    type: "quote",
    grows: true,
    label: "Quote",
    component: Quote,
    defaultProps: {
      quote: "A quote that earns the spread.",
      attribution: "",
    },
    defaultLayout: { colSpan: 8, rowSpan: 9 },
  },
  video: {
    type: "video",
    label: "Video",
    component: Video,
    defaultProps: {
      source: "youtube",
      url: "",
      src: "",
      poster: "",
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      aspect: "16/9",
      fit: "width",
      radius: 0,
    },
    defaultLayout: { colSpan: 8, rowSpan: 18 },
  },
  projectCarousel: {
    type: "projectCarousel",
    label: "Carousel",
    component: ProjectCarousel,
    defaultProps: {
      items: [
        {
          src: "",
          alt: "",
          title: "Project one",
          meta: "2024 — Role",
          description: "A short line about the work.",
          starred: false,
          ...CAROUSEL_ITEM_EFFECT_DEFAULTS,
        },
        {
          src: "",
          alt: "",
          title: "Project two",
          meta: "2023 — Role",
          description: "A short line about the work.",
          starred: false,
          ...CAROUSEL_ITEM_EFFECT_DEFAULTS,
        },
      ],
      variant: "cards",
      cardWidth: 320,
      gap: 24,
      aspect: "4/5",
      radius: 8,
      edgeFade: true,
      showArrows: true,
      newTab: false,
      autoScrollSpeed: 40,
      pauseOnHover: true,
    },
    defaultLayout: { colSpan: 12, rowSpan: 33 },
  },
  projectGrid: {
    type: "projectGrid",
    label: "Image grid",
    component: ProjectGrid,
    defaultProps: {
      items: [
        {
          src: "",
          alt: "",
          title: "Project one",
          titleSrc: "",
          titleWidth: 60,
          meta: "2024 — Role",
          focalX: 50,
          focalY: 50,
        },
        {
          src: "",
          alt: "",
          title: "Project two",
          titleSrc: "",
          titleWidth: 60,
          meta: "2023 — Role",
          focalX: 50,
          focalY: 50,
        },
        {
          src: "",
          alt: "",
          title: "Project three",
          titleSrc: "",
          titleWidth: 60,
          meta: "2022 — Role",
          focalX: 50,
          focalY: 50,
        },
      ],
      columns: 3,
      gap: 16,
      aspect: "16/9",
      radius: 4,
      greyUntilHover: true,
      showMeta: true,
      newTab: false,
    },
    defaultMobileProps: { columns: 1 },
    defaultLayout: { colSpan: 12, rowSpan: 30 },
  },
  socialLinks: {
    type: "socialLinks",
    label: "Social Links",
    component: SocialLinks,
    defaultProps: {
      items: [
        { platform: "linkedin", href: "" },
        { platform: "discord", href: "" },
      ],
      variant: "icons",
      size: 20,
      gap: 20,
      align: "left",
      color: "foreground",
      newTab: true,
    },
    defaultLayout: { colSpan: 3, rowSpan: 3 },
  },
  tags: {
    type: "tags",
    label: "Tags",
    component: Tags,
    defaultProps: {
      tags: [],
      size: 12,
      gap: 8,
      align: "left",
    },
    defaultLayout: { colSpan: 6, rowSpan: 2 },
  },
  postList: {
    type: "postList",
    label: "Post List",
    component: PostList,
    defaultProps: {
      items: [
        {
          title: "First post",
          date: "2026-01-01",
          summary: "A line about what this post covers.",
          href: "",
        },
        {
          title: "Second post",
          date: "2026-01-02",
          summary: "A line about what this post covers.",
          href: "",
        },
      ],
      numbered: true,
      showSummary: true,
      size: "lg",
      newTab: false,
    },
    defaultLayout: { colSpan: 12, rowSpan: 16 },
  },
  heroTitle: {
    type: "heroTitle",
    grows: true,
    label: "Animated title",
    component: HeroTitle,
    defaultProps: { text: "THANG!", as: "h2", align: "center" },
    defaultLayout: { colSpan: 12, rowSpan: 11 },
  },
  postGrid: {
    type: "postGrid",
    grows: true,
    label: "Latest posts",
    component: PostGrid,
    defaultProps: {
      count: 6,
      emptyTitle: "First post is on its way.",
      emptyText:
        "We're warming up the Oven. Dev updates and patch notes will land here soon.",
    },
    defaultLayout: { colSpan: 12, rowSpan: 28 },
  },
  cards: {
    type: "cards",
    grows: true,
    label: "Cards",
    component: Cards,
    defaultProps: {
      items: [
        { icon: "❄", title: "Card one", text: "A line about this card.", status: "" },
        { icon: "❄", title: "Card two", text: "A line about this card.", status: "" },
        { icon: "❄", title: "Card three", text: "A line about this card.", status: "" },
      ],
      columns: 3,
      newTab: false,
    },
    defaultLayout: { colSpan: 12, rowSpan: 12 },
  },
  footer: {
    type: "footer",
    grows: true,
    label: "Footer",
    component: Footer,
    defaultProps: {
      brand: "Thang",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Download", href: "/download" },
        { label: "Privacy", href: "/privacy-policy" },
        { label: "Terms", href: "/terms" },
      ],
      legal: "© 2026 Thang · Stay un-frozen.",
    },
    defaultLayout: { colSpan: 12, rowSpan: 10 },
  },
  fontSpecimen: {
    type: "fontSpecimen",
    grows: true,
    label: "Font specimen",
    component: FontSpecimen,
    defaultProps: {
      family: "display",
      name: "Grandstander",
      role: "Display",
      sample: "Stay un-frozen.",
      ladderText: "Freeze or be frozen",
      weights: [400, 600, 700, 800, 900],
    },
    defaultLayout: { colSpan: 6, rowSpan: 26 },
  },
  swatches: {
    type: "swatches",
    grows: true,
    label: "Color swatches",
    component: Swatches,
    defaultProps: {
      title: "Colors",
      colors: [
        { name: "Ice", varName: "--ice", value: "#84dcff", alpha: false },
        { name: "Ember", varName: "--ember", value: "#ff9344", alpha: false },
      ],
    },
    defaultLayout: { colSpan: 12, rowSpan: 14 },
  },
  mirror: {
    type: "mirror",
    label: "Mirror",
    component: Mirror,
    // An instance is created pointing at a source (the add-block picker lists
    // the library by name, "Make mirror" converts a block in place); an
    // unassigned instance is a valid intermediate that renders a placeholder.
    defaultProps: { mirrorId: "" },
    defaultLayout: { colSpan: 12, rowSpan: 8 },
  },
};

/** Registry entries a mirror source can be — everything except `mirror`. */
export function isSourceBlockType(type: BlockType): type is SourceBlockType {
  return type !== "mirror";
}

export function isBlockType(s: string): s is BlockType {
  return s in atomRegistry;
}

export function defaultsForBlock(type: BlockType): Block["props"] {
  return JSON.parse(
    JSON.stringify(atomRegistry[type].defaultProps)
  ) as Block["props"];
}
