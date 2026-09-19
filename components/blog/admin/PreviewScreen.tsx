import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { AdminGate, BTN_GHOST } from "@/components/blog/admin/AdminGate";
import { Splash, useRouterSlug } from "@/components/blog/admin/EditorScreen";
import { PostLayout } from "@/components/blog/PostLayout";
import { adminFetch } from "@/lib/blog/admin-client";
import type { PostSummary } from "@/lib/blog/content";
import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import { editorPath, publicPath, type ContentKind } from "@/lib/blog/site";

/**
 * Draft preview — the body of /admin/blog/preview/[...slug] (kind "post")
 * and /admin/pages/preview/[...slug] (kind "page"). Renders exactly what the
 * public route renders, but from the admin API so drafts (and unpublished
 * edits that were just saved) are visible. The editor's "Preview ↗" opens
 * this in a new tab, optionally with a `#<section-or-block-id>` hash.
 */
export function PreviewScreen({ kind }: { kind: ContentKind }) {
  const { ready, slug } = useRouterSlug();
  return (
    <>
      <Head>
        <title>
          {slug
            ? `Preview ${publicPath(kind, slug)} — THANG admin`
            : "Preview — THANG admin"}
        </title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGate>
        {ready ? <PreviewLoader kind={kind} slug={slug} /> : <Splash label="Loading…" />}
      </AdminGate>
    </>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      page: Page;
      published: boolean;
      tags: TagDef[];
      mirrors: MirrorDef[];
      posts: PostSummary[];
    };

function PreviewLoader({ kind, slug }: { kind: ContentKind; slug: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const label = slug ? publicPath(kind, slug) : "";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    if (!slug) {
      setState({ status: "error", message: "Missing slug." });
      return;
    }

    (async () => {
      try {
        const [pageRes, siteRes, postsRes] = await Promise.all([
          adminFetch(
            `/api/admin/blog/page?slug=${encodeURIComponent(slug)}&kind=${kind}`
          ),
          adminFetch("/api/admin/blog/site"),
          adminFetch("/api/admin/blog/posts"),
        ]);
        const pageBody = await pageRes.json().catch(() => ({}));
        if (!pageRes.ok) {
          throw new Error(pageBody?.error ?? `HTTP ${pageRes.status}`);
        }
        const site = siteRes.ok ? await siteRes.json().catch(() => null) : null;
        const lists = postsRes.ok ? await postsRes.json().catch(() => null) : null;
        if (cancelled) return;

        const page = pageBody.page as Page;
        const posts: PostSummary[] = Array.isArray(lists?.posts) ? lists.posts : [];
        setState({
          status: "ready",
          page,
          published: !!page.meta.published,
          tags: Array.isArray(site?.tags) ? site.tags : [],
          mirrors: Array.isArray(site?.mirrors) ? site.mirrors : [],
          // Same list the public route hands a Post grid block.
          posts: posts.filter((p) => p.published),
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, slug]);

  // The content arrives after load, so the browser's native hash scroll
  // has nothing to target — do it ourselves once the page is on screen.
  useEffect(() => {
    if (state.status !== "ready") return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(decodeURIComponent(id))?.scrollIntoView({
        block: "start",
      });
    }, 50);
    return () => window.clearTimeout(t);
  }, [state.status]);

  if (state.status === "loading") {
    return <Splash label={`Loading ${label}…`} />;
  }

  if (state.status === "error") {
    return (
      <div className="tw-reset min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="glass-panel rounded-xl p-8 max-w-md w-full">
          <p className="kicker text-ember">Couldn&apos;t load preview</p>
          <h1 className="font-display text-3xl mt-3 break-all">{label}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{state.message}</p>
          <div className="mt-6 flex gap-3">
            <Link href={editorPath(kind, slug)} className={BTN_GHOST}>
              ← Back to editor
            </Link>
            <Link href="/admin/blog" className={BTN_GHOST}>
              Pages &amp; posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PostLayout
      page={state.page}
      tags={state.tags}
      mirrors={state.mirrors}
      posts={state.posts}
      ambient={kind === "page"}
      banner={<DraftBanner kind={kind} slug={slug} published={state.published} />}
    />
  );
}

function DraftBanner({
  kind,
  slug,
  published,
}: {
  kind: ContentKind;
  slug: string;
  published: boolean;
}) {
  const noun = kind === "page" ? "page" : "post";
  return (
    <div className="tw-reset sticky top-0 z-40 glass-strong border-x-0 border-t-0">
      <div className="max-w-5xl mx-auto px-6 h-11 flex items-center justify-center gap-6 flex-wrap">
        <p className={`kicker ${published ? "text-accent" : "text-ember"}`}>
          {published ? `Preview — this ${noun} is live` : "Draft preview — not public"}
        </p>
        <div className="flex items-center gap-4">
          {published && (
            <a
              href={publicPath(kind, slug)}
              target="_blank"
              rel="noreferrer"
              className="kicker text-muted-foreground hover:text-frost transition-colors"
            >
              View live ↗
            </a>
          )}
          <Link
            href={editorPath(kind, slug)}
            className="kicker text-accent hover:text-frost transition-colors"
          >
            Back to editor
          </Link>
          <Link
            href="/admin/blog"
            className="kicker text-muted-foreground hover:text-frost transition-colors"
          >
            Pages &amp; posts
          </Link>
        </div>
      </div>
    </div>
  );
}
