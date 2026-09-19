import Head from "next/head";

import type { Page } from "@/lib/blog/schema";
import type { PostSummary } from "@/lib/blog/content";
import {
  HOME_SLUG,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  pagePath,
  postPath,
} from "@/lib/blog/site";

/**
 * <Head> blocks for the public pages (site pages, /blog, /blog/<slug>) plus the
 * JSON-LD they carry. Everything here is isomorphic — only types are imported
 * from the server-side content module, so this file is safe in client
 * bundles.
 *
 * next/head notes:
 *  - `<title>` and `<meta name=…>` are deduped by Next (last one wins), so a
 *    page-level title overrides the default one in _app.tsx.
 *  - `<meta property=…>` is NOT deduped — that is why we never emit the same
 *    og:* tag twice from one component.
 *  - Children must be plain elements (no custom components), hence `jsonLd()`
 *    is a helper that returns an element rather than a React component.
 */

const DEFAULT_IMAGE = "/ThangScreenshot.png";
const LOGO = "/ThangLogo.png";
const RSS_PATH = "/blog/feed.xml";
const BLOG_TITLE = `${SITE_NAME} Blog`;
const BLOG_DESCRIPTION =
  "Dev updates, patch notes and stories from the team building THANG, the 5v5 freeze-tag shooter.";

/** Absolute URL for a cover: uploads are already absolute, local paths are not. */
function toAbsolute(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}

/** "YYYY-MM-DD" → ISO 8601 (UTC midnight); anything unparsable → "". */
function isoFromDate(date: string): string {
  if (!date) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * Renders a JSON-LD block. `<` is escaped so a stray "</script>" inside a
 * title can never break out of the tag.
 */
export function jsonLd(obj: unknown) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function organization() {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(LOGO),
    },
  };
}

/* ------------------------------------------------------------------ post */

export function PostSeo({
  summary,
  page,
}: {
  summary: PostSummary;
  page: Page;
}) {
  const title = summary.title || page.meta.title;
  const description = summary.description || page.meta.description || SITE_DESCRIPTION;
  const url = absoluteUrl(postPath(summary.slug));
  const image = toAbsolute(summary.cover) || absoluteUrl(DEFAULT_IMAGE);
  // The editorial date (what the page displays) wins over the system
  // publish timestamp — Google wants datePublished to match the visible date.
  const published = isoFromDate(summary.date) || summary.publishedAt || summary.createdAt;
  const modified = summary.updatedAt || published;
  const author = summary.author
    ? { "@type": "Person", name: summary.author }
    : { "@type": "Organization", name: SITE_NAME };

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: title,
    description,
    datePublished: published,
    dateModified: modified,
    author,
    image: [image],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: organization(),
    isPartOf: { "@type": "Blog", "@id": absoluteUrl("/blog#blog"), name: BLOG_TITLE },
    ...(summary.tags.length ? { keywords: summary.tags.join(", ") } : {}),
    inLanguage: "en",
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  return (
    <Head>
      <title>{`${title} — ${BLOG_TITLE}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={BLOG_TITLE}
        href={absoluteUrl(RSS_PATH)}
      />

      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      {summary.coverAlt && <meta property="og:image:alt" content={summary.coverAlt} />}
      <meta property="og:locale" content="en_US" />
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}
      {summary.author && <meta property="article:author" content={summary.author} />}
      {summary.tags.map((tag) => (
        <meta key={`article:tag:${tag}`} property="article:tag" content={tag} />
      ))}

      <meta
        name="twitter:card"
        content={summary.cover ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd(blogPosting)}
      {jsonLd(breadcrumbs)}
    </Head>
  );
}

/* ----------------------------------------------------------------- index */

export function BlogSeo({ posts }: { posts: PostSummary[] }) {
  const url = absoluteUrl("/blog");
  const image = absoluteUrl(DEFAULT_IMAGE);
  const title = `Blog — ${SITE_NAME}`;

  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url,
    publisher: organization(),
    inLanguage: "en",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(postPath(p.slug)),
      datePublished: isoFromDate(p.date) || p.publishedAt || p.createdAt,
      ...(p.cover ? { image: toAbsolute(p.cover) } : {}),
      ...(p.description ? { description: p.description } : {}),
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: url },
    ],
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={BLOG_DESCRIPTION} />
      <link rel="canonical" href={url} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={BLOG_TITLE}
        href={absoluteUrl(RSS_PATH)}
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={BLOG_DESCRIPTION} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={BLOG_DESCRIPTION} />
      <meta name="twitter:image" content={image} />

      {jsonLd(blog)}
      {jsonLd(breadcrumbs)}
    </Head>
  );
}

/* ------------------------------------------------------------ site pages */

/**
 * <Head> for a site page (content/pages/<slug>.json). Title, description and
 * share image come from the page's meta, edited in the editor's Page panel.
 * The home page uses its title as written and also carries the site-level
 * JSON-LD (Organization, WebSite, VideoGame); every other page is
 * "<title> — THANG" with a breadcrumb.
 */
export function PageSeo({ slug, summary }: { slug: string; summary: PostSummary }) {
  const isHome = slug === HOME_SLUG;
  const url = absoluteUrl(pagePath(slug));
  const image = toAbsolute(summary.cover) || absoluteUrl(DEFAULT_IMAGE);
  const description = summary.description || SITE_DESCRIPTION;
  const title = isHome
    ? summary.title || `${SITE_NAME} — 5v5 freeze-tag shooter`
    : `${summary.title} — ${SITE_NAME}`;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url,
    description,
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en",
  };

  const videoGame = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: SITE_NAME,
    url,
    description,
    image,
    genre: ["Shooter", "Multiplayer"],
    playMode: "MultiPlayer",
    applicationCategory: "Game",
    publisher: { "@id": absoluteUrl("/#organization") },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: summary.title,
    description,
    url,
    isPartOf: { "@id": absoluteUrl("/#website") },
    ...(summary.updatedAt ? { dateModified: summary.updatedAt } : {}),
    inLanguage: "en",
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: summary.title, item: url },
    ],
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={BLOG_TITLE}
        href={absoluteUrl(RSS_PATH)}
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      {summary.coverAlt && <meta property="og:image:alt" content={summary.coverAlt} />}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {isHome && jsonLd({ "@context": "https://schema.org", ...organization() })}
      {isHome && jsonLd(website)}
      {isHome && jsonLd(videoGame)}
      {!isHome && jsonLd(webPage)}
      {!isHome && jsonLd(breadcrumbs)}
    </Head>
  );
}
