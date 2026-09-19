import { promises as fs } from "node:fs";
import path from "node:path";
import { ZodError } from "zod";
import {
  pageSchema,
  siteConfigSchema,
  type Page,
  type PageMeta,
  type SiteConfig,
} from "./schema";
import { sanitizeMirrors, sanitizePage } from "./sanitize";
import { HOME_SLUG, pageSlugProblem, type ContentKind } from "./site";

/* ============================================================
   Content persistence (blog posts + site pages) — SERVER ONLY (node:fs).
   Never import this from a component; the admin UI talks to it through
   /api/admin/blog/* and the public pages through getStaticProps.

   Same model as the portfolio's lib/content.ts: content is plain JSON
   committed to the repo, the local editor (`next dev`) writes it, and
   publishing is `git commit && git push` (Vercel rebuilds).
     - content/blog/posts/<slug>.json   one file per post; nested slugs
                                        ("devlog/patch-1") → nested dirs
     - content/pages/<slug>.json        one file per site page, same shape;
                                        "home" renders at "/", the rest at
                                        "/<slug>" (pages/[[...slug]].tsx)
     - content/blog/site.json           { tags, mirrors } — shared by both

   Every post/page function takes a trailing `kind` ("post" by default) that
   picks the collection; everything else about the two is identical.

   Every read runs through `pageSchema.parse` so a broken file fails
   loudly — build included — instead of rendering an empty page, and every
   write validates first. Rich text (text/quote blocks, mirror sources) is
   strict-sanitized on every write AND read — the schema accepts any
   string, so this is what keeps API-written HTML out of the public pages.
   Files are written with 2-space indentation so git diffs stay small.
   ============================================================ */

const CONTENT_ROOT = path.join(process.cwd(), "content", "blog");
const POSTS_ROOT = path.join(CONTENT_ROOT, "posts");
const PAGES_ROOT = path.join(process.cwd(), "content", "pages");
const SITE_FILE = path.join(CONTENT_ROOT, "site.json");

function rootFor(kind: ContentKind): string {
  return kind === "page" ? PAGES_ROOT : POSTS_ROOT;
}

function noun(kind: ContentKind): string {
  return kind === "page" ? "Page" : "Post";
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

/** Lowercase `a-z0-9-` segments, optional `/` folders ("devlog/patch-1"). */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;
export const SLUG_MAX_LENGTH = 120;

export function isValidSlug(slug: string): boolean {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= SLUG_MAX_LENGTH &&
    SLUG_RE.test(slug)
  );
}

function assertSlug(slug: string): void {
  if (!isValidSlug(slug)) throw new Error(`Invalid page slug: ${slug}`);
}

/** Card / index / SEO view of a post — everything but the block canvas. */
export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  cover: string;
  coverAlt: string;
  tags: string[];
  published: boolean;
  /** ISO strings. */
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

/** Shape of a `content/blog/posts/<slug>.json` file. The slug is the file
 *  name, so it is not repeated inside. Dates are ISO strings. */
export type PostDoc = {
  page: Page;
  createdAt: string;
  updatedAt: string;
  /** Set on the first transition to published; never cleared. */
  publishedAt: string | null;
};

/** What a post file looks like before validation. */
type RawDoc = {
  page?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
};

/* ----- Helpers ----- */

function toIso(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string" && typeof value !== "number") return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

/** Today as "YYYY-MM-DD" (UTC) — the seed for a new post's `meta.date`. */
function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Build the summary from a stored document. Reads `page.meta` leniently
 * (defaults for anything missing) so the summary itself never throws —
 * the `pageSchema.parse` happens when the file is read.
 */
export function summaryFromDoc(slug: string, doc: PostDoc): PostSummary {
  const meta = ((doc.page && doc.page.meta) || {}) as Partial<PageMeta>;
  return {
    slug,
    title: typeof meta.title === "string" && meta.title ? meta.title : slug,
    description: typeof meta.description === "string" ? meta.description : "",
    date: typeof meta.date === "string" ? meta.date : "",
    author: typeof meta.author === "string" ? meta.author : "",
    cover: typeof meta.cover === "string" ? meta.cover : "",
    coverAlt: typeof meta.coverAlt === "string" ? meta.coverAlt : "",
    tags: Array.isArray(meta.tags)
      ? meta.tags.filter((t): t is string => typeof t === "string")
      : [],
    published: meta.published === true,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
    publishedAt: doc.publishedAt ? toIso(doc.publishedAt) : null,
  };
}

/** Listing order: `meta.date` desc ("YYYY-MM-DD" sorts as text; an empty
 *  date sinks to the bottom), then `updatedAt` desc. */
function comparePosts(a: PostSummary, b: PostSummary): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

/** Site pages read like a site map: home first, then by URL. */
function comparePages(a: PostSummary, b: PostSummary): number {
  if (a.slug === HOME_SLUG) return -1;
  if (b.slug === HOME_SLUG) return 1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

/* ----- File access ----- */

function errorCode(err: unknown): string | undefined {
  return (err as NodeJS.ErrnoException | null)?.code;
}

/** ENOENT, or ENOTDIR when a path component is a file — both "not there". */
function isMissing(err: unknown): boolean {
  const code = errorCode(err);
  return code === "ENOENT" || code === "ENOTDIR";
}

/** Repo-relative, forward-slash path for error messages. */
function relPath(file: string): string {
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}

/**
 * Absolute path of a post/page file. Validates the slug, then re-checks that
 * the resolved path is still inside the collection's folder so nothing a
 * slug could encode escapes the content dir.
 */
function postFile(slug: string, kind: ContentKind = "post"): string {
  assertSlug(slug);
  const root = rootFor(kind);
  const file = path.resolve(root, `${slug}.json`);
  if (!file.startsWith(root + path.sep)) {
    throw new Error(`Invalid page slug: ${slug}`);
  }
  return file;
}

/** A site page can't shadow a coded route (see RESERVED_PAGE_ROOTS). Checked
 *  when a page file is created — existing files are left readable. */
function assertPageSlugFree(slug: string, kind: ContentKind): void {
  if (kind !== "page") return;
  const problem = pageSlugProblem(slug);
  if (problem) throw new ConflictError(problem);
}

/** Parsed JSON, or `undefined` when the file doesn't exist. Malformed JSON
 *  throws with the file path in the message. */
async function readJsonFile(file: string): Promise<unknown | undefined> {
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (err) {
    if (isMissing(err)) return undefined;
    throw err;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch (err) {
    throw new Error(
      `Invalid JSON in ${relPath(file)}: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err }
    );
  }
}

/** `mkdir -p` the parent, then write stable 2-space JSON with a trailing
 *  newline. `flag: "wx"` makes the write an atomic create (EEXIST when the
 *  file is already there). */
async function writeJsonFile(
  file: string,
  value: unknown,
  flag: "w" | "wx" = "w"
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", {
    encoding: "utf8",
    flag,
  });
}

async function fileExists(file: string): Promise<boolean> {
  try {
    return (await fs.stat(file)).isFile();
  } catch (err) {
    if (isMissing(err)) return false;
    throw err;
  }
}

/** The post file as stored, without validating the page. `null` when the
 *  file is missing. */
async function readRawDoc(
  slug: string,
  kind: ContentKind = "post"
): Promise<RawDoc | null> {
  const file = postFile(slug, kind);
  const raw = await readJsonFile(file);
  if (raw === undefined) return null;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`${relPath(file)} is not a post object`);
  }
  return raw as RawDoc;
}

/**
 * The validated post. Throws NotFoundError when the file is missing and a
 * ZodError when the stored page doesn't match the schema — a hard fail,
 * never a silently-empty page.
 */
async function readDoc(slug: string, kind: ContentKind = "post"): Promise<PostDoc> {
  const raw = await readRawDoc(slug, kind);
  if (!raw) throw new NotFoundError(`${noun(kind)} "${slug}" not found`);
  return {
    page: pageSchema.parse(raw.page),
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    publishedAt: raw.publishedAt ? toIso(raw.publishedAt) : null,
  };
}

/** Serialise the doc in a fixed key order so re-saves don't reshuffle it. */
function docToJson(doc: PostDoc): PostDoc {
  return {
    page: doc.page,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt,
  };
}

/* ----- Posts ----- */

/**
 * Load a page by slug. Throws NotFoundError when missing and a ZodError
 * when the stored JSON doesn't match the schema — we want a hard fail,
 * not a silently-empty page.
 */
export async function loadPage(
  slug: string,
  kind: ContentKind = "post"
): Promise<Page> {
  const { page } = await loadPost(slug, kind);
  return page;
}

/** Load a page plus its summary (dates, publish state). Throws NotFoundError. */
export async function loadPost(
  slug: string,
  kind: ContentKind = "post"
): Promise<{ page: Page; summary: PostSummary }> {
  const doc = await readDoc(slug, kind);
  const page = sanitizePage(doc.page);
  return { page, summary: summaryFromDoc(slug, { ...doc, page }) };
}

/**
 * Persist a page. Validates against pageSchema first (a ZodError propagates
 * so the API route can answer 400 with the detail). Creates the file when
 * missing; `updatedAt` is always bumped; `createdAt` is stamped on the first
 * write; `publishedAt` is stamped on the first transition to published and
 * never cleared afterwards.
 */
export async function savePage(
  slug: string,
  page: unknown,
  kind: ContentKind = "post"
): Promise<{
  page: Page;
  summary: PostSummary;
  created: boolean;
  publishedNow: boolean;
}> {
  const file = postFile(slug, kind);
  const validated = sanitizePage(pageSchema.parse(page));
  const now = new Date().toISOString();

  // Only the wrapper fields are needed from the current file, so a post
  // whose page is broken can still be overwritten by the editor.
  const existing = await readRawDoc(slug, kind);
  const created = !existing;
  if (created) assertPageSlugFree(slug, kind);
  const prevPublishedAt = existing?.publishedAt ? toIso(existing.publishedAt) : null;
  const publishedNow = validated.meta.published && !prevPublishedAt;

  const doc: PostDoc = {
    page: validated,
    createdAt: (existing && toIso(existing.createdAt)) || now,
    updatedAt: now,
    publishedAt: publishedNow ? now : prevPublishedAt,
  };
  await writeJsonFile(file, docToJson(doc));

  return { page: validated, summary: summaryFromDoc(slug, doc), created, publishedNow };
}

/**
 * Create an empty draft. ConflictError when the slug is taken. Seeds
 * `meta.date` with today so the post already sorts sensibly.
 */
export async function createPage(
  slug: string,
  title: string,
  kind: ContentKind = "post"
): Promise<Page> {
  const file = postFile(slug, kind);
  assertPageSlugFree(slug, kind);
  const page = pageSchema.parse({
    // Only a post is dated — the seed makes a new one sort sensibly.
    meta: {
      title: (title || "").trim() || slug,
      ...(kind === "post" ? { date: todayIsoDate() } : {}),
    },
    sections: [],
  });
  const now = new Date().toISOString();
  try {
    // "wx" = create only, so two racing creates can't both win.
    await writeJsonFile(
      file,
      docToJson({ page, createdAt: now, updatedAt: now, publishedAt: null }),
      "wx"
    );
  } catch (err) {
    if (errorCode(err) === "EEXIST") {
      throw new ConflictError(
        `A ${noun(kind).toLowerCase()} with slug "${slug}" already exists`
      );
    }
    throw err;
  }
  return page;
}

/** Remove now-empty folders a nested slug leaves behind, up to the
 *  collection root. Best effort — a non-empty dir simply stops the climb. */
async function pruneEmptyDirs(dir: string, root: string): Promise<void> {
  while (dir !== root && dir.startsWith(root + path.sep)) {
    try {
      await fs.rmdir(dir);
    } catch {
      return;
    }
    dir = path.dirname(dir);
  }
}

/** Delete a post/page. Resolves false when there was no such file. */
export async function deletePage(
  slug: string,
  kind: ContentKind = "post"
): Promise<boolean> {
  const file = postFile(slug, kind);
  try {
    await fs.unlink(file);
  } catch (err) {
    if (isMissing(err)) return false;
    throw err;
  }
  await pruneEmptyDirs(path.dirname(file), rootFor(kind));
  return true;
}

/**
 * Pick "<base>-copy", then "-copy-2", "-copy-3", … up to 99. Bails loudly
 * rather than looping forever on a pathological folder.
 */
async function pickFreeSlug(base: string, kind: ContentKind): Promise<string> {
  const candidates = [
    `${base}-copy`,
    ...Array.from({ length: 98 }, (_, i) => `${base}-copy-${i + 2}`),
  ].filter(isValidSlug);
  for (const cand of candidates) {
    if (!(await fileExists(postFile(cand, kind)))) return cand;
  }
  throw new Error(`Couldn't find a free slug after 99 tries from "${base}".`);
}

/**
 * Clone a post. The copy is always an unpublished draft titled
 * "<title> (copy)". Throws NotFoundError for a missing source and
 * ConflictError when an explicit target already exists.
 */
export async function duplicatePage(
  source: string,
  target?: string,
  kind: ContentKind = "post"
): Promise<string> {
  // Read the source through loadPage so the schema validates it before we
  // copy — better to fail here than write garbage that breaks the editor.
  const sourcePage = await loadPage(source, kind);

  let dest: string;
  if (target) {
    if (await fileExists(postFile(target, kind))) {
      throw new ConflictError(`Target "${target}" already exists`);
    }
    dest = target;
  } else {
    dest = await pickFreeSlug(source, kind);
  }
  assertPageSlugFree(dest, kind);

  const cloned: Page = {
    ...sourcePage,
    meta: {
      ...sourcePage.meta,
      title: `${sourcePage.meta.title} (copy)`,
      published: false,
    },
  };
  const now = new Date().toISOString();
  try {
    await writeJsonFile(
      postFile(dest, kind),
      docToJson({ page: cloned, createdAt: now, updatedAt: now, publishedAt: null }),
      "wx"
    );
  } catch (err) {
    if (errorCode(err) === "EEXIST") {
      throw new ConflictError(`Target "${dest}" already exists`);
    }
    throw err;
  }
  return dest;
}

/**
 * Every `*.json` under a collection root as a slug ("devlog/patch-1" for
 * a nested file). A missing root dir is an empty collection. Dot-entries
 * (.DS_Store) are ignored; a JSON file whose name isn't a valid slug can
 * never be loaded, so it throws instead of vanishing from the list.
 */
async function walkSlugs(
  root: string,
  dir: string,
  prefix: string,
  out: string[]
): Promise<void> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (isMissing(err) && dir === root) return;
    throw err;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await walkSlugs(root, path.join(dir, entry.name), rel, out);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const slug = rel.slice(0, -".json".length);
      if (!isValidSlug(slug)) {
        throw new Error(
          `${relPath(path.join(root, rel))} is not a valid file name (slugs are lowercase a-z0-9- segments)`
        );
      }
      out.push(slug);
    }
  }
}

/**
 * Read every post. A file that fails to parse (bad JSON or a schema
 * mismatch) throws with its path in the message — a hard fail, never a
 * silently shorter list. A file that disappears mid-walk is just gone.
 */
async function listSummaries(
  onlyPublished: boolean,
  kind: ContentKind = "post"
): Promise<PostSummary[]> {
  const root = rootFor(kind);
  const slugs: string[] = [];
  await walkSlugs(root, root, "", slugs);

  const docs = await Promise.all(
    slugs.map(async (slug): Promise<[string, PostDoc] | null> => {
      try {
        return [slug, await readDoc(slug, kind)];
      } catch (err) {
        if (err instanceof NotFoundError) return null;
        if (err instanceof ZodError) {
          throw new Error(
            `${relPath(postFile(slug, kind))} failed validation: ${err.message}`,
            { cause: err }
          );
        }
        throw err;
      }
    })
  );

  return docs
    .filter((entry): entry is [string, PostDoc] => entry !== null)
    .filter(([, doc]) => !onlyPublished || doc.page.meta.published)
    .map(([slug, doc]) => summaryFromDoc(slug, doc))
    .sort(kind === "page" ? comparePages : comparePosts);
}

/** Every post, drafts included — the admin list. */
export async function listPosts(): Promise<PostSummary[]> {
  return listSummaries(false);
}

/** Published posts only — /blog, the home page, feed and sitemap. */
export async function listPublishedPosts(): Promise<PostSummary[]> {
  return listSummaries(true);
}

/** Every site page, drafts included — the admin list. */
export async function listPages(): Promise<PostSummary[]> {
  return listSummaries(false, "page");
}

/** Published site pages only — the root catch-all route and the sitemap. */
export async function listPublishedPages(): Promise<PostSummary[]> {
  return listSummaries(true, "page");
}

/** A published post, or null (missing OR still a draft — same thing to the public). */
export async function getPublishedPost(
  slug: string,
  kind: ContentKind = "post"
): Promise<{ page: Page; summary: PostSummary } | null> {
  if (!isValidSlug(slug)) return null;
  let doc: PostDoc;
  try {
    doc = await readDoc(slug, kind);
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
  if (!doc.page.meta.published) return null;
  const page = sanitizePage(doc.page);
  return { page, summary: summaryFromDoc(slug, { ...doc, page }) };
}

/**
 * Neighbours within the published list, in listPublishedPosts() order:
 * `prev` is the newer post, `next` the older one.
 */
export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: PostSummary | null; next: PostSummary | null }> {
  const list = await listPublishedPosts();
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}

/**
 * Whether rendering `page` needs the published-post list: true when a Post
 * grid block sits on the page, or in any mirror it could be showing. Lets
 * the static routes skip reading every post file for pages that don't.
 */
export function usesPostGrid(page: Page, mirrors: SiteConfig["mirrors"]): boolean {
  const blocks = page.sections.flatMap((section) => section.blocks);
  if (blocks.some((block) => block.type === "postGrid")) return true;
  return (
    blocks.some((block) => block.type === "mirror") &&
    mirrors.some((mirror) => mirror.source.type === "postGrid")
  );
}

/* ----- Site config (tag + mirror libraries) ----- */

/** Writes to site.json run one at a time. The editor keeps an independent
 *  debounce per library (and a mirrored Tags block fires both in one tick),
 *  so two concurrent patches must never restore each other's key from a
 *  stale read-modify-write snapshot. */
let siteQueue: Promise<unknown> = Promise.resolve();

function withSiteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = siteQueue.then(task, task);
  siteQueue = run.catch(() => undefined);
  return run;
}

async function writeSiteConfig(config: SiteConfig): Promise<void> {
  await writeJsonFile(SITE_FILE, { tags: config.tags, mirrors: config.mirrors });
}

/**
 * Load the site config, or fall back to schema defaults when site.json
 * doesn't exist yet. Always validates so a hand-edited file with garbage
 * gets rejected at the boundary instead of poisoning later renders — an
 * invalid file logs and falls back to defaults, the same way the
 * portfolio's file-backed original treats an unreadable site.json.
 */
export async function loadSiteConfig(): Promise<SiteConfig> {
  let raw: unknown;
  try {
    raw = await readJsonFile(SITE_FILE);
  } catch (err) {
    console.warn(
      "[blog/content] Unreadable site.json, using defaults:",
      err instanceof Error ? err.message : err
    );
    return siteConfigSchema.parse({});
  }
  if (raw === undefined) return siteConfigSchema.parse({});
  const parsed = siteConfigSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[blog/content] Invalid site.json, using defaults:", parsed.error.message);
    return siteConfigSchema.parse({});
  }
  return { ...parsed.data, mirrors: sanitizeMirrors(parsed.data.mirrors) };
}

/** Persist the whole site config. Validates first; a ZodError propagates. */
export async function saveSiteConfig(config: unknown): Promise<SiteConfig> {
  const parsed = siteConfigSchema.parse(config);
  const validated: SiteConfig = { ...parsed, mirrors: sanitizeMirrors(parsed.mirrors) };
  await withSiteLock(() => writeSiteConfig(validated));
  return validated;
}

/**
 * Patch only the keys present in `partial` (`tags` and/or `mirrors`) with
 * one read-modify-write of site.json, serialised through `withSiteLock`.
 * Validates first — a ZodError propagates with the `tags.` / `mirrors.`
 * path prefix intact. Returns the full config.
 */
export async function patchSiteConfig(partial: unknown): Promise<SiteConfig> {
  const body =
    typeof partial === "object" && partial !== null && !Array.isArray(partial)
      ? (partial as Record<string, unknown>)
      : {};
  const patch: Partial<SiteConfig> = {};
  if ("tags" in body) {
    patch.tags = siteConfigSchema.pick({ tags: true }).parse({ tags: body.tags }).tags;
  }
  if ("mirrors" in body) {
    patch.mirrors = sanitizeMirrors(
      siteConfigSchema.pick({ mirrors: true }).parse({ mirrors: body.mirrors }).mirrors
    );
  }
  return withSiteLock(async () => {
    const next: SiteConfig = { ...(await loadSiteConfig()), ...patch };
    await writeSiteConfig(next);
    return next;
  });
}
