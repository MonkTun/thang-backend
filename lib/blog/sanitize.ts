import type { MirrorDef, Page } from "./schema";

/**
 * Tiny HTML sanitizer for the editor's rich-text fields. We only allow a
 * very small whitelist of inline tags (<strong>, <em>, <br>). Anything else
 * is stripped (its text children are preserved, the tag itself is dropped).
 *
 * Two implementations of the same contract:
 *   - `sanitizeRichText`        editor commit path; uses the DOM, so it copes
 *                               with whatever contentEditable produced.
 *   - `sanitizeRichTextStrict`  isomorphic, regex-only, idempotent; runs on
 *                               the server for every write AND read
 *                               (lib/blog/content.ts) and again at render in
 *                               the Text/Quote atoms, so content written
 *                               through the API or a stale document can never
 *                               reach `dangerouslySetInnerHTML` un-sanitized.
 */

const ALLOWED = new Set(["strong", "em", "br"]);

export function sanitizeRichText(html: string): string {
  if (typeof document === "undefined") return sanitizeRichTextStrict(html);
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  return walk(wrap).replace(/(<br>\s*)+$/g, "");
}

/** A bare `&` — one that does not already start a character reference. */
const BARE_AMP = /&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g;

/** The whitelist, as real tags: `<strong>`, `</em>`, `<br>`, `<br/>`, `<b>`… */
const TAG_RE = /<(\/?)(strong|b|em|i)>|<br\s*\/?>/gi;

function escapeText(s: string): string {
  return s.replace(BARE_AMP, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Tokenize the bare whitelist tags and escape everything between them.
 * Because the tags are matched BEFORE escaping, pre-escaped text such as
 * `&lt;br&gt;` (what the DOM sanitizer stores when an author literally types
 * "<br>") stays text, so the function is a true no-op on the editor's output
 * and idempotent. Tags with attributes (`<strong onclick=…>`) are not on the
 * whitelist and end up visible as escaped text; `<b>`/`<i>` normalize to
 * `<strong>`/`<em>` like the DOM path does.
 */
export function sanitizeRichTextStrict(html: string): string {
  if (typeof html !== "string" || html === "") return "";
  let out = "";
  let last = 0;
  for (const m of html.matchAll(TAG_RE)) {
    out += escapeText(html.slice(last, m.index));
    if (m[2] === undefined) {
      out += "<br>";
    } else {
      const t = m[2].toLowerCase();
      out += `<${m[1]}${t === "b" ? "strong" : t === "i" ? "em" : t}>`;
    }
    last = m.index + m[0].length;
  }
  return out + escapeText(html.slice(last));
}

type ContentBlock = { type: string; props: Record<string, unknown> };

/** Strict-sanitize the rich-text props of one block (text / quote). */
export function sanitizeBlockContent<T extends ContentBlock>(block: T): T {
  if (block.type === "text") {
    const content = block.props.content;
    if (typeof content === "string") {
      const clean = sanitizeRichTextStrict(content);
      if (clean !== content) {
        return { ...block, props: { ...block.props, content: clean } } as T;
      }
    }
    return block;
  }
  if (block.type === "quote") {
    const next: Record<string, unknown> = { ...block.props };
    let changed = false;
    for (const key of ["quote", "attribution"] as const) {
      const value = block.props[key];
      if (typeof value !== "string") continue;
      const clean = sanitizeRichTextStrict(value);
      if (clean !== value) {
        next[key] = clean;
        changed = true;
      }
    }
    return changed ? ({ ...block, props: next } as T) : block;
  }
  return block;
}

/** Every text/quote block on the page, strict-sanitized. */
export function sanitizePage(page: Page): Page {
  return {
    ...page,
    sections: page.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => sanitizeBlockContent(block)),
    })),
  };
}

/** Mirror sources are blocks too — same treatment. */
export function sanitizeMirrors(mirrors: MirrorDef[]): MirrorDef[] {
  return mirrors.map((m) => ({ ...m, source: sanitizeBlockContent(m.source) }));
}

function walk(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escape(node.textContent ?? "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as Element;
  const raw = el.tagName.toLowerCase();
  // Normalize the deprecated tags execCommand still produces.
  const tag = raw === "b" ? "strong" : raw === "i" ? "em" : raw;
  const inner = Array.from(el.childNodes).map(walk).join("");

  if (tag === "br") return "<br>";
  if (ALLOWED.has(tag)) return `<${tag}>${inner}</${tag}>`;
  // Block-ish wrappers contentEditable creates on Enter — convert to a
  // line break so multiline content survives the round-trip.
  if (tag === "div" || tag === "p") return inner + "<br>";
  // Anything else: drop the tag, keep its content.
  return inner;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
