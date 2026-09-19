import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAdminGate } from "@/lib/blog/admin-client";

/**
 * Admin chrome for the blog (Squarespace-style back office).
 *
 *   <AdminGate>   — renders its children when the editor is available
 *                   (only under `next dev`; see lib/blog/admin-client.ts),
 *                   otherwise a splash explaining that the editor runs
 *                   locally. There is no login: publishing is `git push`.
 *   <AdminShell>  — top bar + centered content column for the list pages.
 *                   The block editor and the draft preview sit OUTSIDE the
 *                   shell so they keep their full-bleed canvas.
 *
 * Every root element carries `tw-reset` (the scoped Tailwind preflight in
 * styles/blog.css) so headings, buttons and lists don't pick up browser
 * defaults from the marketing stylesheet.
 */

/* ---------------- shared button / input classes ---------------- */

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-body text-sm font-bold bg-gradient-to-br from-ember-soft to-ember-deep text-ember-ink shadow-ember transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed";

export const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-body text-sm font-bold border border-border-strong text-frost bg-glass transition-colors hover:border-ice hover:bg-glass-strong disabled:opacity-40 disabled:cursor-not-allowed";

export const INPUT =
  "w-full bg-background/60 border border-border rounded-md px-3 py-2 font-body text-sm text-foreground transition-colors focus:outline-none focus:border-accent placeholder:text-foreground/35";

/* ---------------- splash ---------------- */

function Splash({ children }: { children: ReactNode }) {
  return (
    <div className="tw-reset min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="text-center">{children}</div>
    </div>
  );
}

/* ---------------- gate ---------------- */

export function AdminGate({ children }: { children: ReactNode }) {
  const gate = useAdminGate();

  if (gate.status !== "ok") {
    return (
      <Splash>
        <div className="glass-panel rounded-xl p-8 max-w-md w-full text-left">
          <p className="kicker text-ember">Local only</p>
          <h1 className="font-display text-3xl mt-3">
            The blog editor only runs locally
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Start the site with{" "}
            <code className="text-foreground text-xs">npm run dev</code> and
            open this page on localhost. Posts are JSON files in the repo;
            commit and push to publish them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className={BTN_GHOST}>
              Back to site
            </Link>
          </div>
        </div>
      </Splash>
    );
  }

  return <>{children}</>;
}

/* ---------------- shell ---------------- */

export function AdminShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const router = useRouter();
  const onPosts = router.pathname === "/admin/blog";

  return (
    <div className="tw-reset min-h-screen bg-background text-foreground">
      <header className="glass-strong border-x-0 border-t-0 sticky top-0 z-30 h-14">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center gap-6">
          <Link
            href="/admin/blog"
            className="font-display text-lg font-extrabold text-frost whitespace-nowrap"
          >
            THANG <span className="text-muted-foreground font-normal">·</span>{" "}
            Site
          </Link>

          <nav className="flex items-center gap-4 text-sm font-bold">
            <Link
              href="/admin/blog"
              className={
                onPosts
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              Pages &amp; posts
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              View site ↗
            </a>
          </nav>

          <div
            className="ml-auto kicker text-muted-foreground whitespace-nowrap"
            title="Saves write JSON files under content/pages and content/blog. Commit and push them to publish."
          >
            Local editor · commit &amp; push to publish
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-frost">
            {title}
          </h1>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
