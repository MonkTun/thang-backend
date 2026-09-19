/* ============================================================
   Browser-side helpers for the blog admin. Safe to import from any
   component; never touches the filesystem or any server SDK.

   There is no sign-in: the editor only runs under `next dev` (the API
   routes 404 in every production build), so `adminFetch` is a plain
   `fetch` and the gate is a build-time constant.
   ============================================================ */

/** Inlined at build time — a production bundle can never flip this on.
 *  Mirrors `isAdminAvailable()` on the server. */
export const ADMIN_AVAILABLE: boolean = process.env.NODE_ENV === "development";

/** `fetch` for /api/admin/blog/* — no auth header. Never caches — admin
 *  reads must always see the latest save. */
export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}

export type AdminGateState = { status: "ok" | "unavailable" };

const GATE_STATE: AdminGateState = Object.freeze({
  status: ADMIN_AVAILABLE ? "ok" : "unavailable",
}) as AdminGateState;

/**
 * Whether the editor is usable here. Resolves synchronously from
 * ADMIN_AVAILABLE (same object every render, so it is safe in effect
 * deps); kept as a hook so AdminGate's call site doesn't change.
 */
export function useAdminGate(): AdminGateState {
  return GATE_STATE;
}

/**
 * Slug from free text: lowercase, `a-z0-9` and `-`, "/" folders preserved,
 * runs of dashes collapsed, leading/trailing dashes trimmed. Same rules as
 * the portfolio's NewPageForm; the server re-validates with SLUG_RE.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "")
    .replace(/-\//g, "/")
    .replace(/\/-/g, "/");
}
