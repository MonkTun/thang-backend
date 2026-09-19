import type { NextApiRequest, NextApiResponse } from "next";

/* ============================================================
   Admin gate for /api/admin/blog/* — SERVER ONLY.

   There is no login. The editor only exists under `next dev` on the
   author's own machine (the portfolio model): every production build —
   Vercel included — answers 404 for the admin API, so it is unreachable
   over the public internet. The repo's git push rights are the real auth
   boundary; publishing is `git commit && git push`.

   In development the gate additionally insists the caller is the author's
   own browser or shell on this machine (see isLocalRequest), because
   `next dev` listens on every interface and Next applies no CSRF/Host
   check to pages API routes.
   ============================================================ */

export type AdminUser = { uid: string; email: string };

/** Who every local request runs as. */
export const LOCAL_ADMIN: AdminUser = { uid: "local", email: "local@dev" };

/** True only under `next dev`. Inlined at build time, so production bundles
 *  are hard-wired to false. */
export function isAdminAvailable(): boolean {
  return process.env.NODE_ENV === "development";
}

const LOOPBACK_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

/** Host header normalised through URL parsing ("localhost:80" == "localhost"). */
function normaliseHostHeader(host: string | undefined): { host: string; hostname: string } {
  if (!host) return { host: "", hostname: "" };
  try {
    const u = new URL(`http://${host}`);
    return { host: u.host, hostname: u.hostname };
  } catch {
    return { host: "", hostname: "" };
  }
}

/**
 * `next dev` binds every interface and Next applies no CSRF/Host check to
 * pages API routes, so accept only requests that (1) came in over loopback,
 * (2) were addressed to a localhost name — this defeats DNS rebinding, which
 * passes every other check — and (3) were not initiated by another site.
 *
 * The editor's own adminFetch calls (http://localhost:3000, 127.0.0.1 or
 * [::1]) send Sec-Fetch-Site: same-origin with Origin == Host over loopback,
 * and curl from the author's shell sends neither header, so both pass.
 * Blocked: cross-site no-cors text/plain POSTs, Origin: null, any LAN
 * socket, and rebinding hosts.
 */
function isLocalRequest(req: NextApiRequest): boolean {
  const ip = req.socket?.remoteAddress ?? "";
  if (!LOOPBACK_IPS.has(ip)) return false;

  const { host, hostname } = normaliseHostHeader(req.headers.host);
  if (!isLocalHostname(hostname)) return false;

  const site = String(req.headers["sec-fetch-site"] ?? "");
  if (site && site !== "same-origin" && site !== "none") return false;

  const origin = req.headers.origin;
  if (origin !== undefined) {
    if (origin === "null") return false;
    try {
      if (new URL(origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Call first in every /api/admin/blog/* handler. Returns the local admin,
 * or writes 404 { error: "Not found" } and returns null outside
 * development — so the handler is just
 * `const user = requireAdmin(req, res); if (!user) return;`.
 * In development a request that is not from this machine / same origin
 * gets 403 { error: "Local only" } instead.
 * Synchronous; an `await` on it is harmless.
 */
export function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): AdminUser | null {
  if (!isAdminAvailable()) {
    res.status(404).json({ error: "Not found" });
    return null;
  }
  if (!isLocalRequest(req)) {
    res.status(403).json({ error: "Local only" });
    return null;
  }
  return LOCAL_ADMIN;
}
