import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminGate, BTN_GHOST } from "@/components/blog/admin/AdminGate";
import { adminFetch } from "@/lib/blog/admin-client";
import type { PostSummary } from "@/lib/blog/content";
import type { MirrorDef, Page, TagDef } from "@/lib/blog/schema";
import { pagePath, publicPath, type ContentKind } from "@/lib/blog/site";

/**
 * The Squarespace-style block editor for one post or site page — the body of
 * /admin/blog/edit/[...slug] (kind "post") and /admin/pages/edit/[...slug]
 * (kind "page"). Full-bleed (no NavBar / FooterNav / AdminShell): the Editor
 * brings its own toolbar, canvas and properties panel.
 *
 * Everything loads on the client after the admin gate resolves:
 *   page  — /api/admin/blog/page?slug=&kind=   (required)
 *   site  — /api/admin/blog/site               (tag + mirror libraries; optional)
 *   posts — /api/admin/blog/posts              (link picker + Post grid; optional)
 *
 * The Editor is imported with ssr:false — it drives react-grid-layout and
 * window/document APIs, and there is nothing worth server-rendering here.
 */

const Editor = dynamic(
  () => import("@/components/blog/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => <Splash label="Loading editor…" />,
  }
);

export function Splash({ label }: { label: string }) {
  return (
    <div className="tw-reset min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <p className="kicker">{label}</p>
    </div>
  );
}

export function slugFromQuery(q: string | string[] | undefined): string {
  if (Array.isArray(q)) return q.join("/");
  return typeof q === "string" ? q : "";
}

/** router.isReady is false on the server and can already be true on the
 *  client's first render, so branching on it directly is a hydration
 *  mismatch (Next documents it as effect-only). Mirror it into state so the
 *  first client render matches the server and the loader mounts right after
 *  hydration. */
export function useRouterSlug(): { ready: boolean; slug: string } {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (router.isReady) setReady(true);
  }, [router.isReady]);
  return { ready, slug: slugFromQuery(router.query.slug) };
}

export function EditorScreen({ kind }: { kind: ContentKind }) {
  const { ready, slug } = useRouterSlug();
  return (
    <>
      <Head>
        <title>
          {slug ? `Edit ${publicPath(kind, slug)} — THANG admin` : "Edit — THANG admin"}
        </title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGate>
        {ready ? <EditorLoader kind={kind} slug={slug} /> : <Splash label="Loading…" />}
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
      tags: TagDef[];
      mirrors: MirrorDef[];
      links: string[];
      posts: PostSummary[];
    };

function EditorLoader({ kind, slug }: { kind: ContentKind; slug: string }) {
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

        // Libraries and the content lists are nice-to-have: if either
        // request fails the editor still opens, just with empty pickers.
        const site = siteRes.ok ? await siteRes.json().catch(() => null) : null;
        const lists = postsRes.ok ? await postsRes.json().catch(() => null) : null;
        const posts: PostSummary[] = Array.isArray(lists?.posts) ? lists.posts : [];
        const pages: PostSummary[] = Array.isArray(lists?.pages) ? lists.pages : [];

        if (cancelled) return;
        setState({
          status: "ready",
          page: pageBody.page as Page,
          tags: Array.isArray(site?.tags) ? site.tags : [],
          mirrors: Array.isArray(site?.mirrors) ? site.mirrors : [],
          // Link picker: site pages as hrefs, posts as slugs.
          links: [...pages.map((p) => pagePath(p.slug)), ...posts.map((p) => p.slug)],
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

  if (state.status === "loading") {
    return <Splash label={`Loading ${label}…`} />;
  }

  if (state.status === "error") {
    return (
      <div className="tw-reset min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="glass-panel rounded-xl p-8 max-w-md w-full">
          <p className="kicker text-ember">
            Couldn&apos;t open {kind === "page" ? "page" : "post"}
          </p>
          <h1 className="font-display text-3xl mt-3 break-all">{label}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{state.message}</p>
          <div className="mt-6">
            <Link href="/admin/blog" className={BTN_GHOST}>
              ← Back to pages &amp; posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-reset">
      {/* Keyed so navigating between documents remounts the editor (its undo
          history and selection are per-document state). */}
      <Editor
        key={`${kind}:${slug}`}
        slug={slug}
        kind={kind}
        initialPage={state.page}
        availablePages={state.links}
        posts={state.posts}
        initialTags={state.tags}
        initialMirrors={state.mirrors}
      />
    </div>
  );
}
