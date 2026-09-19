import { z } from "zod";

/* ============================================================
   New schema — page is a list of Sections; each section is a
   12-column fluid grid containing atomic Blocks. Both the public
   renderer and the admin editor consume this schema directly.

   Coordinate system:
     - col: 1..12  (1-indexed for human-friendliness in JSON)
     - colSpan: 1..12
     - row: 1..N   (1-indexed; auto-flow if omitted)
     - rowSpan: positive integer in ROW_HEIGHT_PX (16px) row units — see
       lib/grid.ts; `content/` was migrated from 8px rows in Aug 2026
   ============================================================ */

export const blockLayoutSchema = z.object({
  col: z.number().int().min(1).max(12),
  colSpan: z.number().int().min(1).max(12),
  row: z.number().int().min(1).optional(),
  rowSpan: z.number().int().min(1).optional(),
  /**
   * Stretch the block past the section's safe area (the centered max-width +
   * padding content box) toward the section/viewport edge — for accentuating
   * an element with a full-bleed. Intended for blocks sitting at the matching
   * grid edge (left → col 1, right → ends at col 12). Omitted = "none".
   */
  bleed: z.enum(["none", "left", "right", "both"]).optional(),
});

/**
 * Per-block mobile overrides. Sparse — anything omitted falls back to the
 * desktop block. `props` is intentionally loose here (z.record); the merge
 * helper in `lib/responsive.ts` filters keys against MOBILE_OVERRIDABLE_KEYS
 * at render time, so an out-of-list key in saved JSON is silently dropped
 * rather than rejected.
 */
export const mobileBlockOverrideSchema = z
  .object({
    hidden: z.boolean().optional(),
    layout: z
      .object({
        col: z.number().int().min(1).max(12).optional(),
        colSpan: z.number().int().min(1).max(12).optional(),
        row: z.number().int().min(1).optional(),
        rowSpan: z.number().int().min(1).optional(),
      })
      .optional(),
    props: z.record(z.string(), z.unknown()).optional(),
  })
  .optional();

/** Per-section mobile overrides. Same sparse-merge semantics. */
export const sectionMobileOverrideSchema = z
  .object({
    padding: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
    minHeight: z.enum(["auto", "half", "screen"]).optional(),
    align: z.enum(["top", "center", "bottom"]).optional(),
  })
  .optional();

/* ----- Atomic blocks (TEXT, IMAGE, BUTTON, SPACER, LINE, QUOTE) ----- */

export const textVariantSchema = z.enum([
  "h1",
  "h2",
  "h3",
  "body",
  "caption",
  "kicker",
]);

export const textColorSchema = z.enum(["foreground", "muted", "accent"]);

export const textTransformSchema = z.enum(["none", "upper", "lower"]);

export const textPropsSchema = z.object({
  /** HTML string. Allowed inline tags: <strong>, <em>, <br>. */
  content: z.string(),
  variant: textVariantSchema,
  align: z.enum(["left", "center", "right"]).default("left"),
  color: textColorSchema.default("foreground"),
  /** Force uppercase / lowercase. Independent of the user's typed casing. */
  transform: textTransformSchema.default("none"),
  /** Optional pixel-size override. When set, beats the variant's clamp(). */
  fontSize: z.number().int().min(8).max(512).optional(),
  /** Optional line-height multiplier. Overrides the variant's leading. */
  lineHeight: z.number().min(0.6).max(3).optional(),
  /** Optional letter-spacing in em. Overrides the variant's tracking. */
  letterSpacing: z.number().min(-0.2).max(1).optional(),
});

export const imageFilterSchema = z.enum([
  "none",
  "bw",
  "sepia",
  "noir",
  "faded",
  "warm",
  "cool",
]);

/** Color token used for tint overlays. */
export const imageTintSchema = z.enum([
  "none",
  "background",
  "foreground",
  "accent",
]);

export const imagePropsSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
  fit: z.enum(["cover", "contain"]).default("cover"),
  /** Optional href — wraps the image in a link. */
  href: z.string().optional(),
  /** Optional aspect ratio override (CSS aspect-ratio). */
  aspect: z.string().optional(),
  /** Corner radius in px. 0 = sharp. */
  radius: z.number().int().min(0).max(200).default(0),
  /** Non-destructive CSS filter preset. */
  filter: imageFilterSchema.default("none"),
  /** Focal point as 0–100% of the image. Drives object-position so
   *  fit:cover crops around the chosen point. */
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
  /** Visual-only rotation in degrees. Source file is untouched. */
  rotate: z.number().min(-360).max(360).default(0),
  /** Mirror across the vertical axis. */
  flipX: z.boolean().default(false),
  /** Mirror across the horizontal axis. */
  flipY: z.boolean().default(false),
  /** Gaussian blur in px. */
  blur: z.number().int().min(0).max(50).default(0),
  /** Scale factor — scales the image within its frame, toward the focal
   *  point. 1 = fit, 3 = 3× in; below 1 shrinks the image inside its
   *  block (the frame shows through around it). */
  zoom: z.number().min(0.2).max(3).default(1),
  /** Color overlay token; rendered as an absolute div on top of the image. */
  tint: imageTintSchema.default("none"),
  /** 0–100; opacity of the tint overlay. */
  tintOpacity: z.number().int().min(0).max(100).default(0),
});

export const buttonPropsSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "ghost"]).default("primary"),
  align: z.enum(["left", "center", "right"]).default("left"),
  /** Open the link in a new tab (target="_blank" + rel="noopener noreferrer"). */
  newTab: z.boolean().default(false),
});

export const spacerPropsSchema = z.object({
  height: z.number().int().min(1).max(400).default(48),
});

export const linePropsSchema = z.object({
  thickness: z.union([z.literal(1), z.literal(2)]).default(1),
  color: z.enum(["border", "foreground", "accent"]).default("border"),
});

export const quotePropsSchema = z.object({
  quote: z.string(),
  attribution: z.string().optional(),
});

/** Video embed — a YouTube URL or an uploaded video file. */
export const videoPropsSchema = z.object({
  /** Where the video comes from: a YouTube embed (`url`) or an uploaded
   *  file (`src`, an uploaded path under /uploads/blog/videos). */
  source: z.enum(["youtube", "file"]).default("youtube"),
  /** Any supported YouTube URL form, or a bare 11-char video id. */
  url: z.string(),
  /** Uploaded video URL — used when `source` is "file". */
  src: z.string().default(""),
  /** Poster image URL shown before an uploaded video starts. */
  poster: z.string().default(""),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(false),
  loop: z.boolean().default(false),
  controls: z.boolean().default(true),
  /** Start offset in seconds. */
  start: z.number().int().min(0).optional(),
  /** CSS aspect-ratio for the wrapper, e.g. "16/9" or "9/16". */
  aspect: z.string().default("16/9"),
  /** Which block dimension the video sizes from: "width" fills the block's
   *  width and derives height from `aspect`; "height" fills the block's
   *  height and derives width. */
  fit: z.enum(["width", "height"]).default("width"),
  /** Corner radius in px. */
  radius: z.number().int().min(0).max(200).default(0),
});

/** One project card inside a Project Carousel. */
export const carouselItemSchema = z.object({
  /** Card image path (upload or manual). Empty renders a placeholder tile. */
  src: z.string().default(""),
  alt: z.string().default(""),
  /** Display title (rendered in --font-display). */
  title: z.string().default(""),
  /** Mono kicker above the title, e.g. "2024 — Game design". */
  meta: z.string().default(""),
  /** Short summary line under the title. */
  description: z.string().default(""),
  /** Optional link — wraps the whole card. */
  href: z.string().optional(),
  /** Featured item — shows a star badge on the card. */
  starred: z.boolean().default(false),
  /* Per-image effects, edited via the shared image dialog (same controls as
     the Image block and section backgrounds). */
  filter: imageFilterSchema.default("none"),
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
  rotate: z.number().min(-360).max(360).default(0),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false),
  blur: z.number().int().min(0).max(50).default(0),
  zoom: z.number().min(0.2).max(3).default(1),
  tint: imageTintSchema.default("none"),
  tintOpacity: z.number().int().min(0).max(100).default(0),
});

/** Per-image effect defaults for a freshly added carousel item. Shared by the
 *  registry's starter items and the editor's "add project" action so a new item
 *  always carries the full (no-op) effect set the shared image dialog edits. */
export const CAROUSEL_ITEM_EFFECT_DEFAULTS = {
  filter: "none" as const,
  focalX: 50,
  focalY: 50,
  rotate: 0,
  flipX: false,
  flipY: false,
  blur: 0,
  zoom: 1,
  tint: "none" as const,
  tintOpacity: 0,
};

/**
 * Horizontal, scroll-snapped strip of project cards. Built for the home page
 * to hold the work that isn't a hero highlight — drag / arrow through it.
 * One image + meta/title/description per card; carousel-level knobs control
 * sizing and the shared image treatment.
 */
export const projectCarouselPropsSchema = z.object({
  items: z.array(carouselItemSchema).default([]),
  /**
   * Layout variant:
   *  - "cards"   — snap-scrolled cards with meta/title/description.
   *  - "marquee" — image-only band that drifts on its own at a constant
   *    velocity and can also be grabbed / flung; loops seamlessly.
   */
  variant: z.enum(["cards", "marquee"]).default("cards"),
  /** Card width in px. The strip scrolls horizontally past this width. */
  cardWidth: z.number().int().min(80).max(640).default(320),
  /** Gap between cards in px. */
  gap: z.number().int().min(0).max(96).default(24),
  /** Image aspect ratio per card (CSS aspect-ratio, e.g. "4/5"). */
  aspect: z.string().default("4/5"),
  /** Corner radius in px on each card image. 0 = sharp. */
  radius: z.number().int().min(0).max(200).default(8),
  /** Fade the left/right edges of the strip so cards soften in/out instead of
   *  hard-cutting at the frame. */
  edgeFade: z.boolean().default(true),
  /** Show the prev/next arrow controls. "cards" only. */
  showArrows: z.boolean().default(true),
  /** Open card links in a new tab. */
  newTab: z.boolean().default(false),
  /**
   * "marquee" only — auto-drift speed in px/second. 0 disables the drift
   * (still grabbable). Collapsed to 0 under prefers-reduced-motion.
   */
  autoScrollSpeed: z.number().min(0).max(300).default(40),
  /** "marquee" only — pause the drift while the pointer is over the strip. */
  pauseOnHover: z.boolean().default(true),
});

/** Platforms the Social Links block knows how to draw an icon for. */
/* ----- Project Grid -----
   A rectangular tile grid for the /projects index: every tile is a
   background image with either a title image (logo) or display text set
   over it. Tiles sit desaturated until hovered — the hover is the color.
   `columns` is the md+ count; the phone count is a per-block mobile
   override of the same key (MOBILE_OVERRIDABLE_KEYS.projectGrid), so it
   rides the existing desktop/mobile merge instead of a second prop. */
export const projectGridItemSchema = z.object({
  /** Background image. */
  src: z.string().default(""),
  alt: z.string().default(""),
  /** Display-type title; also the accessible name when a title image is set. */
  title: z.string().default(""),
  /** Optional title image (logo / wordmark) rendered instead of the text. */
  titleSrc: z.string().default(""),
  /** Width of the title image as a % of the tile. */
  titleWidth: z.number().int().min(10).max(100).default(60),
  /** Mono kicker in the tile corner — e.g. "2024 — Unity". */
  meta: z.string().default(""),
  href: z.string().optional(),
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
});

export const projectGridPropsSchema = z.object({
  items: z.array(projectGridItemSchema).default([]),
  columns: z.number().int().min(1).max(6).default(3),
  gap: z.number().int().min(0).max(96).default(16),
  aspect: z.string().default("16/9"),
  radius: z.number().int().min(0).max(200).default(4),
  /** Tiles are greyed out until hovered (always in color on touch). */
  greyUntilHover: z.boolean().default(true),
  showMeta: z.boolean().default(true),
  newTab: z.boolean().default(false),
});

export const socialPlatformSchema = z.enum([
  "linkedin",
  "discord",
  "github",
  "instagram",
  "x",
  "youtube",
  "email",
  "website",
]);

export const socialLinkItemSchema = z.object({
  platform: socialPlatformSchema,
  /** Full URL (or mailto:) — e.g. https://www.linkedin.com/in/you. */
  href: z.string().default(""),
  /** Optional custom label — shown on "pills", used as aria-label on "icons".
   *  Empty falls back to the platform's display name. */
  label: z.string().optional(),
});

/**
 * Row of social/profile links. Two looks:
 *  - "icons" — bare brand glyphs that tint to the accent on hover.
 *  - "pills" — ghost-button chips with icon + mono kicker label.
 */
export const socialLinksPropsSchema = z.object({
  items: z.array(socialLinkItemSchema).default([]),
  variant: z.enum(["icons", "pills"]).default("icons"),
  /** Icon size in px. */
  size: z.number().int().min(14).max(48).default(20),
  /** Gap between items in px. */
  gap: z.number().int().min(0).max(64).default(20),
  align: z.enum(["left", "center", "right"]).default("left"),
  /** Resting color; hover is always the accent. */
  color: z.enum(["foreground", "muted", "accent"]).default("foreground"),
  newTab: z.boolean().default(true),
});

/**
 * Row of tag pills (white label on a fully-rounded colored chip). Tags are
 * defined once in the project-wide library (content/site.json — name +
 * color) and referenced here by NAME, so recoloring "C++" in the library
 * updates every page that uses it. Names missing from the library fall
 * back to the accent token.
 */
export const tagsPropsSchema = z.object({
  /** Tag names, resolved against the site tag library at render time. */
  tags: z.array(z.string()).default([]),
  /** Label font size in px; pill padding scales with it (em-based). */
  size: z.number().int().min(9).max(32).default(12),
  /** Gap between pills in px. */
  gap: z.number().int().min(0).max(48).default(8),
  align: z.enum(["left", "center", "right"]).default("left"),
});

/**
 * Mirror INSTANCE. A mirror is a Figma-style component: one source of truth
 * (`MirrorDef` in content/site.json — a block type + its props) that can be
 * placed any number of times on any page. The instance stores only the
 * reference; its grid layout / bleed / mobile overrides stay per-instance
 * because *where* something sits is local, *what* it is is shared. Editing
 * the props of any instance edits the source, so every instance follows.
 */
export const mirrorPropsSchema = z.object({
  /** Id of the `MirrorDef` this instance renders. Empty = unassigned. */
  mirrorId: z.string().default(""),
});

/**
 * One entry in a Post List — a blog post (or any dated piece) the list links
 * to. Same idea as a carousel item, minus the image: the blog is text-first.
 * `date` is a free string so YJ can write "2026-09-02" or "Sep 2026".
 */
export const postListItemSchema = z.object({
  title: z.string().default(""),
  /** Mono kicker beside the title — a date, or any short label. */
  date: z.string().default(""),
  /** One-line summary under the title. */
  summary: z.string().default(""),
  /** Link — usually the post's own page, e.g. "/blog/hello-world". */
  href: z.string().optional(),
});

/**
 * Vertical editorial index of posts — the blog's table of contents. Built to
 * be a mirror (`mir_posts`) so the same list sits on the blog index and at the
 * foot of every post; add a post once and every instance follows.
 */
export const postListPropsSchema = z.object({
  items: z.array(postListItemSchema).default([]),
  /** Show a two-digit running number in front of each entry. */
  numbered: z.boolean().default(true),
  /** Render the summary line (off = title + date only, a tighter index). */
  showSummary: z.boolean().default(true),
  /** Title scale — "lg" is the blog-index size, "md" fits a post's outro. */
  size: z.enum(["md", "lg"]).default("lg"),
  /** Open links in a new tab. */
  newTab: z.boolean().default(false),
});

/* ----- Site-page blocks -----
   Added when the marketing pages (home, /download, /brand, legal) became
   editor pages. They keep the hand-built look of those pages — each renders
   the matching classes from styles/globals.css — while the copy moves into
   content/pages/*.json. */

/**
 * Animated wordmark — the home hero's letter-by-letter "THANG!" (springy
 * drop-in, slow bob, hover hop). Styled by `.hero__title` in globals.css.
 */
export const heroTitlePropsSchema = z.object({
  text: z.string().default("THANG!"),
  /** Heading level. Use exactly one h1 per page. */
  as: z.enum(["h1", "h2"]).default("h1"),
  align: z.enum(["left", "center", "right"]).default("center"),
});

/**
 * Grid of the newest PUBLISHED blog posts as cards (the home page's "Latest
 * from the Oven"). The posts are not stored in the block: they are read from
 * content/blog/posts at build time and handed down through PostsContext.
 */
export const postGridPropsSchema = z.object({
  /** How many posts to show, newest first. 0 = every published post. */
  count: z.number().int().min(0).max(48).default(6),
  /** Shown in place of the grid while there are no published posts. */
  emptyTitle: z.string().default("First post is on its way."),
  emptyText: z
    .string()
    .default(
      "We're warming up the Oven. Dev updates and patch notes will land here soon."
    ),
});

/** One glass card in a Cards block. */
export const cardItemSchema = z.object({
  /** Short glyph in the icon tile (emoji or symbol). Empty hides the tile. */
  icon: z.string().default("❄"),
  title: z.string().default(""),
  text: z.string().default(""),
  /** Pill at the foot of the card, e.g. "Coming soon". Empty hides it. */
  status: z.string().default(""),
  /** Optional link — wraps the whole card. */
  href: z.string().optional(),
});

/** Row of THANG glass cards (`.card` in globals.css) — the /download
 *  platform cards. `columns` is the md+ count; phones stack to one. */
export const cardsPropsSchema = z.object({
  items: z.array(cardItemSchema).default([]),
  columns: z.number().int().min(1).max(4).default(3),
  newTab: z.boolean().default(false),
});

export const footerLinkSchema = z.object({
  label: z.string().default(""),
  href: z.string().default(""),
});

/**
 * Site footer (`.footer` in globals.css). Meant to be a mirror so every page
 * shares one footer: edit the links once and each instance follows.
 */
export const footerPropsSchema = z.object({
  brand: z.string().default("Thang"),
  links: z.array(footerLinkSchema).default([]),
  legal: z.string().default(""),
});

/** Brand guide — one typeface panel: name, role, a sample line and the
 *  weight ladder. */
export const fontSpecimenPropsSchema = z.object({
  /** Which brand font the panel is set in. */
  family: z.enum(["display", "body"]).default("display"),
  name: z.string().default(""),
  /** Small uppercase label beside the name, e.g. "Display". */
  role: z.string().default(""),
  sample: z.string().default(""),
  /** Line repeated once per weight in the ladder. */
  ladderText: z.string().default(""),
  weights: z.array(z.number().int().min(100).max(900)).default([]),
});

export const swatchSchema = z.object({
  name: z.string().default(""),
  /** CSS custom property the color ships as, e.g. "--ice". */
  varName: z.string().default(""),
  /** Any CSS color — hex or rgba(). Clicking the swatch copies it. */
  value: z.string().default(""),
  /** Translucent color — drawn over a checkerboard. */
  alpha: z.boolean().default(false),
});

/** Brand guide — one titled group of click-to-copy color swatches. */
export const swatchesPropsSchema = z.object({
  title: z.string().default(""),
  colors: z.array(swatchSchema).default([]),
});

/* ----- Discriminated union of block types ----- */

/* `{ type, props }` per block type, without layout. These are what a mirror
   definition stores (a source is a block minus its position), and the
   placeable block variants below extend them with id + layout + mobile. A
   mirror can't mirror a mirror, so `mirror` is not in this list. */
const textContent = z.object({ type: z.literal("text"), props: textPropsSchema });
const imageContent = z.object({ type: z.literal("image"), props: imagePropsSchema });
const buttonContent = z.object({ type: z.literal("button"), props: buttonPropsSchema });
const spacerContent = z.object({ type: z.literal("spacer"), props: spacerPropsSchema });
const lineContent = z.object({ type: z.literal("line"), props: linePropsSchema });
const quoteContent = z.object({ type: z.literal("quote"), props: quotePropsSchema });
const videoContent = z.object({ type: z.literal("video"), props: videoPropsSchema });
const projectCarouselContent = z.object({
  type: z.literal("projectCarousel"),
  props: projectCarouselPropsSchema,
});
const projectGridContent = z.object({
  type: z.literal("projectGrid"),
  props: projectGridPropsSchema,
});
const socialLinksContent = z.object({
  type: z.literal("socialLinks"),
  props: socialLinksPropsSchema,
});
const tagsContent = z.object({ type: z.literal("tags"), props: tagsPropsSchema });
const mirrorContent = z.object({ type: z.literal("mirror"), props: mirrorPropsSchema });
const postListContent = z.object({ type: z.literal("postList"), props: postListPropsSchema });
const heroTitleContent = z.object({ type: z.literal("heroTitle"), props: heroTitlePropsSchema });
const postGridContent = z.object({ type: z.literal("postGrid"), props: postGridPropsSchema });
const cardsContent = z.object({ type: z.literal("cards"), props: cardsPropsSchema });
const footerContent = z.object({ type: z.literal("footer"), props: footerPropsSchema });
const fontSpecimenContent = z.object({
  type: z.literal("fontSpecimen"),
  props: fontSpecimenPropsSchema,
});
const swatchesContent = z.object({ type: z.literal("swatches"), props: swatchesPropsSchema });

/** A block's content only — what a mirror source is. Never a `mirror`. */
export const blockContentSchema = z.discriminatedUnion("type", [
  textContent,
  imageContent,
  buttonContent,
  spacerContent,
  lineContent,
  quoteContent,
  videoContent,
  projectCarouselContent,
  projectGridContent,
  socialLinksContent,
  tagsContent,
  postListContent,
  heroTitleContent,
  postGridContent,
  cardsContent,
  footerContent,
  fontSpecimenContent,
  swatchesContent,
]);

const blockBase = {
  id: z.string(),
  layout: blockLayoutSchema,
  mobile: mobileBlockOverrideSchema,
};

export const blockSchema = z.discriminatedUnion("type", [
  textContent.extend(blockBase),
  imageContent.extend(blockBase),
  buttonContent.extend(blockBase),
  spacerContent.extend(blockBase),
  lineContent.extend(blockBase),
  quoteContent.extend(blockBase),
  videoContent.extend(blockBase),
  projectCarouselContent.extend(blockBase),
  projectGridContent.extend(blockBase),
  socialLinksContent.extend(blockBase),
  tagsContent.extend(blockBase),
  postListContent.extend(blockBase),
  heroTitleContent.extend(blockBase),
  postGridContent.extend(blockBase),
  cardsContent.extend(blockBase),
  footerContent.extend(blockBase),
  fontSpecimenContent.extend(blockBase),
  swatchesContent.extend(blockBase),
  mirrorContent.extend(blockBase),
]);

/**
 * Mirror DEFINITION — the single source of truth behind every `mirror`
 * instance with this id. Site-wide (content/site.json, next to the tag
 * library) because instances live on many pages. Renaming is free; deleting
 * one leaves its instances rendering an "unlinked" placeholder until they're
 * re-pointed or removed.
 */
export const mirrorDefSchema = z.object({
  id: z.string().min(1).max(60),
  /** Human label shown in the editor (layers panel, picker, properties). */
  name: z.string().min(1).max(80),
  source: blockContentSchema,
});

export type MirrorDef = z.infer<typeof mirrorDefSchema>;

/* ----- Section ----- */

export const sectionBackgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("transparent") }),
  z.object({
    type: z.literal("color"),
    token: z.enum(["background", "surface", "accent"]),
  }),
  // Inverse section. Foreground becomes the background, background becomes
  // the text color — so on a dark page this paints a section in the warm
  // cream (--foreground) with dark text. Descendants reading --background
  // / --foreground (Tailwind text-foreground, bg-surface, etc.) pick up
  // the swapped values via an inner wrapper; see sectionBackgroundStyle.
  z.object({ type: z.literal("reverse") }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
    /** Which section dimension the image scales to match:
     *  - "both" — cover: fills width AND height, cropping whatever
     *    overflows (the classic full-bleed backdrop).
     *  - "x" — matches the section's width; height follows the image's
     *    own aspect ratio. Taller overflow crops toward the focal point,
     *    a shorter image leaves the section background showing.
     *  - "y" — matches the section's height; width follows likewise. */
    fit: z.enum(["both", "x", "y"]).default("both"),
    /** 0-100, % darkening overlay (legacy field — prefer tint+tintOpacity). */
    overlay: z.number().min(0).max(100).default(0),
    /** Same non-destructive effects as the Image atom. */
    filter: imageFilterSchema.default("none"),
    focalX: z.number().min(0).max(100).default(50),
    focalY: z.number().min(0).max(100).default(50),
    rotate: z.number().min(-360).max(360).default(0),
    flipX: z.boolean().default(false),
    flipY: z.boolean().default(false),
    blur: z.number().int().min(0).max(50).default(0),
    zoom: z.number().min(0.2).max(3).default(1),
    tint: imageTintSchema.default("none"),
    tintOpacity: z.number().int().min(0).max(100).default(0),
    /** Melt the bottom of the image into the page background so the next
     *  section starts without a hard edge (the home hero). Optional rather
     *  than defaulted so existing JSON and editor seeds stay untouched. */
    fadeBottom: z.boolean().optional(),
    /** Drift the image at a fraction of the scroll speed. Off under
     *  prefers-reduced-motion. */
    parallax: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("video"),
    /** YouTube embed (`url`) or an uploaded file (`src`). */
    source: z.enum(["youtube", "file"]).default("youtube"),
    /** YouTube URL or video id. */
    url: z.string(),
    /** Uploaded video URL — used when `source` is "file". */
    src: z.string().default(""),
    /** 0-100, % overlay darken for legibility. */
    overlay: z.number().min(0).max(100).default(40),
    muted: z.boolean().default(true),
    loop: z.boolean().default(true),
    start: z.number().int().min(0).optional(),
    /** Playback speed. YouTube's IFrame API only accepts a fixed set of
     *  rates — 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2 — so the editor UI
     *  exposes those discretely; off-list values are coerced server-side. */
    playbackRate: z.number().min(0.25).max(2).default(1),
    /** Color tint overlay (no mask — videos are opaque, full rect). */
    tint: imageTintSchema.default("none"),
    tintOpacity: z.number().int().min(0).max(100).default(0),
  }),
]);

export const sectionPaddingSchema = z.enum(["none", "sm", "md", "lg", "xl"]);

export const sectionMinHeightSchema = z.enum([
  "auto",
  "half",
  "screen",
]);

export const sectionAlignSchema = z.enum(["top", "center", "bottom"]);

export const sectionSchema = z.object({
  id: z.string(),
  background: sectionBackgroundSchema.default({ type: "transparent" }),
  padding: sectionPaddingSchema.default("lg"),
  minHeight: sectionMinHeightSchema.default("auto"),
  align: sectionAlignSchema.default("top"),
  /** Opt-in hover focus: the section greys out (desaturated + dimmed)
   *  whenever the pointer is not over it, and restores on hover.
   *  Hover-capable devices only — touch viewports always render full color
   *  (see `.section-dim-unhovered` in globals.css). Optional rather than
   *  defaulted so existing JSON and section templates stay untouched. */
  dimUnhovered: z.boolean().optional(),
  mobile: sectionMobileOverrideSchema,
  blocks: z.array(blockSchema),
});

/* ----- Page ----- */

/**
 * Page metadata — what the index cards and SEO tags need. Shared by blog
 * posts (content/blog/posts) and site pages (content/pages); `date`,
 * `author` and `tags` only mean something on a post. The canvas
 * (`sections`) is the whole visible page.
 */
export const pageMetaSchema = z.object({
  title: z.string(),
  /** Excerpt — shown on cards and used as the meta description. */
  description: z.string().default(""),
  /** "YYYY-MM-DD" — display + sort order. */
  date: z.string().default(""),
  author: z.string().default(""),
  /** Cover image URL (upload or manual). */
  cover: z.string().default(""),
  coverAlt: z.string().default(""),
  /** Tag names — resolved against the site tag library like the Tags block. */
  tags: z.array(z.string()).default([]),
  /** Only published posts appear on /blog, the home page, the feed and the
   *  sitemap, and only published pages have a public URL. Drafts stay
   *  reachable through the admin preview. */
  published: z.boolean().default(false),
  /** Falling-snow layer (PixelSnow) fixed behind the whole page; shows
   *  through every section without an opaque background. */
  snow: z.boolean().default(false),
});

export type PageMeta = z.infer<typeof pageMetaSchema>;

export const pageSchema = z.object({
  meta: pageMetaSchema,
  sections: z.array(sectionSchema),
});

/* ----- Site config -----
   Site-wide libraries shared by every post: the tag library and the mirror
   library. Persisted as the `blog_site` singleton document in MongoDB. ----- */

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex like #5C8A3A");

/** One project-wide tag definition: a reusable name + its pill color.
 *  Tags blocks reference these by name (see tagsPropsSchema). */
export const tagDefSchema = z.object({
  name: z.string().min(1).max(40),
  color: hexColor,
});

export type TagDef = z.infer<typeof tagDefSchema>;

export const siteConfigSchema = z.object({
  /** Project-wide tag library shared by every Tags block. */
  tags: z.array(tagDefSchema).default([]),
  /** Mirror library — source blocks that `mirror` instances render. */
  mirrors: z.array(mirrorDefSchema).default([]),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

/* ----- Inferred types ----- */

export type BlockLayout = z.infer<typeof blockLayoutSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
/** `{ type, props }` of a non-mirror block — the shape a mirror source has. */
export type BlockContent = z.infer<typeof blockContentSchema>;
/** Block types a mirror may point at — everything except `mirror` itself. */
export type SourceBlockType = BlockContent["type"];
export type MobileBlockOverride = NonNullable<
  z.infer<typeof mobileBlockOverrideSchema>
>;
export type SectionMobileOverride = NonNullable<
  z.infer<typeof sectionMobileOverrideSchema>
>;

export type TextProps = z.infer<typeof textPropsSchema>;
export type ImageProps = z.infer<typeof imagePropsSchema>;
export type ButtonProps = z.infer<typeof buttonPropsSchema>;
export type SpacerProps = z.infer<typeof spacerPropsSchema>;
export type LineProps = z.infer<typeof linePropsSchema>;
export type QuoteProps = z.infer<typeof quotePropsSchema>;
export type VideoProps = z.infer<typeof videoPropsSchema>;
export type CarouselItem = z.infer<typeof carouselItemSchema>;
export type ProjectCarouselProps = z.infer<typeof projectCarouselPropsSchema>;
export type ProjectGridItem = z.infer<typeof projectGridItemSchema>;
export type ProjectGridProps = z.infer<typeof projectGridPropsSchema>;
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type SocialLinkItem = z.infer<typeof socialLinkItemSchema>;
export type SocialLinksProps = z.infer<typeof socialLinksPropsSchema>;
export type TagsProps = z.infer<typeof tagsPropsSchema>;
export type MirrorProps = z.infer<typeof mirrorPropsSchema>;
export type PostListItem = z.infer<typeof postListItemSchema>;
export type PostListProps = z.infer<typeof postListPropsSchema>;
export type HeroTitleProps = z.infer<typeof heroTitlePropsSchema>;
export type PostGridProps = z.infer<typeof postGridPropsSchema>;
export type CardItem = z.infer<typeof cardItemSchema>;
export type CardsProps = z.infer<typeof cardsPropsSchema>;
export type FooterLink = z.infer<typeof footerLinkSchema>;
export type FooterProps = z.infer<typeof footerPropsSchema>;
export type FontSpecimenProps = z.infer<typeof fontSpecimenPropsSchema>;
export type Swatch = z.infer<typeof swatchSchema>;
export type SwatchesProps = z.infer<typeof swatchesPropsSchema>;

export type Section = z.infer<typeof sectionSchema>;
export type SectionBackground = z.infer<typeof sectionBackgroundSchema>;
export type SectionPadding = z.infer<typeof sectionPaddingSchema>;
export type SectionMinHeight = z.infer<typeof sectionMinHeightSchema>;
export type SectionAlign = z.infer<typeof sectionAlignSchema>;

export type Page = z.infer<typeof pageSchema>;
