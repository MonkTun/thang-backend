import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AdminGate,
  AdminShell,
  BTN_GHOST,
  BTN_PRIMARY,
  INPUT,
} from "@/components/blog/admin/AdminGate";
import { adminFetch, slugify } from "@/lib/blog/admin-client";
import {
  HOME_SLUG,
  editorPath,
  formatPostDate,
  pageSlugProblem,
  previewPath,
  publicPath,
  type ContentKind,
} from "@/lib/blog/site";
import type { PostSummary } from "@/lib/blog/content";

/**
 * /admin/blog — everything editable on the site: the site pages
 * (content/pages) and the blog posts (content/blog/posts). Port of the
 * portfolio's app/admin/(config)/pages/page.tsx + NewPageForm + PageRowMenu.
 *
 * Site pages come first in one "Pages" group (home, then by URL). Posts are
 * grouped by their leading folder segment: slugs without a slash sit in the
 * root "Posts" group, everything else groups alphabetically under its folder
 * ("devlog/patch-1" → "devlog"). Data comes from /api/admin/blog/posts on
 * the client, so this page never SSRs content.
 */

/** A list row: a summary plus the collection it came from. */
type Item = PostSummary & { kind: ContentKind };

/**
 * Dev-only: the editor exists only under `next dev`. A production build
 * turns this page into a 404 (the portfolio's proxy behaviour) — the page
 * stays static, no getServerSideProps.
 */
export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === "development" ? { props: {} } : { notFound: true };

export default function AdminPostsPage() {
  return (
    <>
      <Head>
        <title>Pages &amp; posts — THANG admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGate>
        <PostsIndex />
      </AdminGate>
    </>
  );
}

/* ---------------- grouping ---------------- */

const ROOT_GROUP = "__root__";

function groupFor(slug: string): string {
  const i = slug.indexOf("/");
  return i === -1 ? ROOT_GROUP : slug.slice(0, i);
}

function leafName(slug: string): string {
  return slug.split("/").pop() ?? slug;
}

type Group = { key: string; label: string; posts: Item[] };

// Posts keep the API order inside each group (date desc, then updated desc)
// — a blog reads newest-first, unlike the portfolio's alphabetical pages.
function buildGroups(posts: Item[]): Group[] {
  const map = new Map<string, Item[]>();
  for (const post of posts) {
    const key = groupFor(post.slug);
    const list = map.get(key) ?? [];
    list.push(post);
    map.set(key, list);
  }
  const root: Group | null = map.has(ROOT_GROUP)
    ? { key: ROOT_GROUP, label: "Posts", posts: map.get(ROOT_GROUP)! }
    : null;
  const folders: Group[] = [...map.entries()]
    .filter(([k]) => k !== ROOT_GROUP)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({ key, label: key, posts: list }));
  return root ? [root, ...folders] : folders;
}

/* ---------------- time helpers ---------------- */

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return "—";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return formatPostDate(iso.slice(0, 10)) || "—";
}

/* ---------------- index ---------------- */

function PostsIndex() {
  const [posts, setPosts] = useState<Item[] | null>(null);
  const [pages, setPages] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminFetch("/api/admin/blog/posts");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      const tag = (list: unknown, kind: ContentKind): Item[] =>
        Array.isArray(list) ? list.map((p: PostSummary) => ({ ...p, kind })) : [];
      setPages(tag(body?.pages, "page"));
      setPosts(tag(body?.posts, "post"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPosts((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo<Group[]>(
    () => [
      ...(pages.length > 0 ? [{ key: "__pages__", label: "Pages", posts: pages }] : []),
      ...buildGroups(posts ?? []),
    ],
    [pages, posts]
  );
  const existing = useMemo(
    () => ({
      page: pages.map((p) => p.slug),
      post: (posts ?? []).map((p) => p.slug),
    }),
    [pages, posts]
  );
  const publishedCount = useMemo(
    () => (posts ?? []).filter((p) => p.published).length,
    [posts]
  );

  function focusNewPost() {
    slugInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    slugInputRef.current?.focus();
  }

  return (
    <AdminShell
      title="Pages & posts"
      actions={
        <button type="button" onClick={focusNewPost} className={BTN_PRIMARY}>
          + New
        </button>
      }
    >
      <p className="text-muted-foreground max-w-2xl leading-relaxed">
        Every page of the site is edited here. A published page is live at
        its URL; published posts appear on{" "}
        <a href="/blog" target="_blank" rel="noreferrer" className="text-accent hover:text-frost">
          /blog
        </a>{" "}
        and the home page; drafts are only visible here. Use a slash in the
        slug (e.g.{" "}
        <code className="text-foreground text-xs">devlog/patch-1</code>) to
        file something under a folder. Tip: append{" "}
        <code className="text-foreground text-xs">/edit</code> to any page URL
        to open it in the editor.
      </p>

      {posts && (pages.length > 0 || posts.length > 0) && (
        <p className="kicker mt-4">
          {pages.length} {pages.length === 1 ? "page" : "pages"} ·{" "}
          {posts.length} {posts.length === 1 ? "post" : "posts"} ·{" "}
          {publishedCount} published · {posts.length - publishedCount} draft
          {posts.length - publishedCount === 1 ? "" : "s"}
        </p>
      )}

      {error && (
        <div className="mt-6 glass-subtle rounded-md px-4 py-3 text-sm text-ember flex items-center justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={() => void load()} className="kicker text-accent">
            Retry
          </button>
        </div>
      )}

      {posts === null && !error && (
        <p className="kicker mt-12">Loading…</p>
      )}

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <PostGroup key={group.key} group={group} onChanged={load} />
        ))}
      </div>

      {posts !== null && posts.length === 0 && !error && (
        <p className="mt-12 text-muted-foreground italic">
          No posts yet — create the first one below.
        </p>
      )}

      <NewPostForm existing={existing} slugInputRef={slugInputRef} />
    </AdminShell>
  );
}

/* ---------------- group + row ---------------- */

function PostGroup({
  group,
  onChanged,
}: {
  group: Group;
  onChanged: () => Promise<void>;
}) {
  const n = group.posts.length;
  const unit = group.posts[0]?.kind === "page" ? "page" : "post";
  return (
    <section>
      <header className="flex items-baseline justify-between gap-4 pb-3 border-b border-border">
        <h2 className="kicker text-foreground">{group.label}</h2>
        <span className="kicker text-foreground/40">
          {n} {n === 1 ? unit : `${unit}s`}
        </span>
      </header>
      <ul className="divide-y divide-border">
        {group.posts.map((post) => (
          <PostRow key={`${post.kind}:${post.slug}`} post={post} onChanged={onChanged} />
        ))}
      </ul>
    </section>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-[0.12em] uppercase ${
        published
          ? "bg-accent/15 text-accent"
          : "bg-foreground/10 text-muted-foreground"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function PostRow({
  post,
  onChanged,
}: {
  post: Item;
  onChanged: () => Promise<void>;
}) {
  return (
    <li className="group flex items-center justify-between gap-4 py-5 px-3 -mx-3 rounded-lg transition-colors hover:bg-glass">
      <Link
        href={editorPath(post.kind, post.slug)}
        className="flex-1 min-w-0 flex items-center justify-between gap-6"
      >
        <div className="min-w-0">
          <p className="kicker flex items-center gap-2 flex-wrap">
            <span className="truncate">{publicPath(post.kind, post.slug)}</span>
            <StatusPill published={post.published} />
          </p>
          <p className="font-display text-2xl md:text-3xl mt-2 truncate text-frost">
            {post.title || leafName(post.slug)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {post.kind === "post" && (
              <>
                {formatPostDate(post.date) || "No date"}
                <span className="mx-2 text-foreground/25">·</span>
              </>
            )}
            updated {relativeTime(post.updatedAt)}
            {post.author && (
              <>
                <span className="mx-2 text-foreground/25">·</span>
                {post.author}
              </>
            )}
          </p>
        </div>
        <span className="kicker text-accent transition-transform group-hover:translate-x-1 shrink-0 hidden sm:inline">
          Edit →
        </span>
      </Link>
      <PostRowMenu post={post} onChanged={onChanged} />
    </li>
  );
}

/* ---------------- row menu (port of PageRowMenu) ---------------- */

function PostRowMenu({
  post,
  onChanged,
}: {
  post: Item;
  onChanged: () => Promise<void>;
}) {
  const { kind } = post;
  const path = publicPath(kind, post.slug);
  // "/" has to exist — the home page can be unpublished, never deleted.
  const isHome = kind === "page" && post.slug === HOME_SLUG;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function call(label: string, fn: () => Promise<void>): Promise<void> {
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function duplicate() {
    const res = await adminFetch("/api/admin/blog/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: post.slug, kind }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
    router.push(editorPath(kind, body.slug));
  }

  // Publish/unpublish = load the full page, flip meta.published, save it
  // back through the same route the editor uses.
  async function togglePublished() {
    const get = await adminFetch(
      `/api/admin/blog/page?slug=${encodeURIComponent(post.slug)}&kind=${kind}`
    );
    const got = await get.json().catch(() => ({}));
    if (!get.ok) throw new Error(got?.error ?? `HTTP ${get.status}`);
    const page = got.page;
    const next = {
      ...page,
      meta: { ...page.meta, published: !post.published },
    };
    const save = await adminFetch("/api/admin/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: post.slug, kind, page: next }),
    });
    const saved = await save.json().catch(() => ({}));
    if (!save.ok) {
      throw new Error(saved?.detail ?? saved?.error ?? `HTTP ${save.status}`);
    }
    await onChanged();
  }

  async function remove() {
    const ok = window.confirm(
      `Delete "${post.title || post.slug}" (${path})?\n\nThis permanently removes the ${kind} and can't be undone.`
    );
    if (!ok) return;
    const res = await adminFetch("/api/admin/blog/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: post.slug, kind }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
    await onChanged();
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        disabled={busy !== null}
        aria-label={`Actions for ${path}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="kicker px-2 py-1 rounded-sm text-foreground/40 hover:text-accent hover:bg-foreground/5 transition-colors disabled:opacity-40"
      >
        {busy ? "…" : "•••"}
      </button>

      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 z-30 w-56 glass-strong rounded-md shadow-2xl py-1.5 text-sm"
        >
          <MenuLink href={editorPath(kind, post.slug)}>Edit</MenuLink>
          <MenuLink href={previewPath(kind, post.slug)} newTab>
            Preview ↗
          </MenuLink>
          {post.published && (
            <MenuLink href={path} newTab>
              View live ↗
            </MenuLink>
          )}
          <MenuItem onClick={() => call("duplicate", duplicate)}>
            Duplicate
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => call("publish", togglePublished)}
            checked={post.published}
          >
            {post.published ? "Unpublish" : "Publish"}
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => call("delete", remove)}
            danger
            disabled={isHome}
            title={isHome ? "The home page can't be deleted — unpublish it instead." : undefined}
          >
            Delete
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  newTab,
}: {
  href: string;
  children: ReactNode;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      className="block px-3 py-1.5 hover:bg-foreground/5 hover:text-accent transition-colors"
    >
      {children}
    </Link>
  );
}

function MenuItem({
  onClick,
  children,
  checked,
  disabled,
  danger,
  title,
}: {
  onClick: () => void;
  children: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
        disabled
          ? "text-foreground/30 cursor-not-allowed"
          : danger
            ? "hover:bg-ember/10 hover:text-ember"
            : "hover:bg-foreground/5 hover:text-accent"
      }`}
    >
      <span>{children}</span>
      {checked && <span className="text-accent kicker">✓</span>}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1.5 border-t border-border" />;
}

/* ---------------- new post form (port of NewPageForm) ---------------- */

// Same rule as lib/blog/content.ts SLUG_RE — kept local because content.ts
// is server-only (it reads the content/ directory with node:fs).
const SLUG_RE = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;

function NewPostForm({
  existing,
  slugInputRef,
}: {
  existing: Record<ContentKind, string[]>;
  slugInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<ContentKind>("post");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const cleanSlug = slugify(slug);
  const collides = cleanSlug.length > 0 && existing[kind].includes(cleanSlug);
  const slugInvalid =
    cleanSlug.length > 0 && (!SLUG_RE.test(cleanSlug) || cleanSlug.length > 120);
  // A site page can't shadow a coded route (/login, /blog, /api, …).
  const reserved =
    kind === "page" && cleanSlug.length > 0 && !slugInvalid
      ? pageSlugProblem(cleanSlug)
      : null;
  const submittable =
    cleanSlug.length > 0 && !collides && !slugInvalid && !reserved && !busy;

  // Typing a title first suggests a slug from it until the slug is edited
  // by hand — the usual "New post" flow.
  const [slugTouched, setSlugTouched] = useState(false);
  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!submittable) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await adminFetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: cleanSlug,
          title: title.trim() || cleanSlug,
          kind,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.detail ?? body?.error ?? `HTTP ${res.status}`);
      }
      router.push(editorPath(kind, cleanSlug));
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-12 glass-subtle rounded-lg p-5 space-y-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <p className="kicker text-foreground">New</p>
        <div className="flex gap-1" role="radiogroup" aria-label="What to create">
          {(["post", "page"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`kicker px-3 py-1 rounded-full border transition-colors ${
                kind === k
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border text-foreground/50 hover:text-foreground"
              }`}
            >
              {k === "post" ? "Blog post" : "Site page"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="kicker block mb-1.5">title</span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={kind === "post" ? "Patch 0.4 — Frostbite update" : "Press kit"}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className="kicker block mb-1.5">slug</span>
          <input
            ref={slugInputRef}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={kind === "post" ? "patch-0-4, devlog/frostbite" : "press, guides/controls"}
            className={INPUT}
          />
          {cleanSlug && (
            <span className="block mt-1 text-xs text-muted-foreground">
              {publicPath(kind, cleanSlug)}
            </span>
          )}
        </label>
        <button type="submit" disabled={!submittable} className={BTN_PRIMARY}>
          {busy ? "Creating…" : kind === "post" ? "Create post" : "Create page"}
        </button>
      </div>
      {collides && (
        <p className="text-xs italic text-muted-foreground">
          A {kind} with that slug already exists.
        </p>
      )}
      {reserved && (
        <p className="text-xs italic text-muted-foreground">{reserved}</p>
      )}
      {slugInvalid && (
        <p className="text-xs italic text-muted-foreground">
          Slug must start with a letter or digit and use only{" "}
          <code className="text-foreground">a–z 0–9 -</code>, with{" "}
          <code className="text-foreground">/</code> between folder segments.
        </p>
      )}
      {err && <p className="text-xs italic text-ember">Error: {err}</p>}
    </form>
  );
}
