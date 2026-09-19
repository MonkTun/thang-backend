# ThangBackend — notes for Claude

Next.js 16 Pages Router site + game backend for THANG. The marketing blog and its editor are documented in README → "Blog & editor"; keep that section accurate when touching `lib/blog`, `components/blog`, `pages/[[...slug]].tsx`, `pages/blog`, `pages/admin/blog`, `pages/admin/pages` or `content/`.

## Site pages are editor pages (since 2026-09-19)

Home (`/`), `/download`, `/brand`, `/privacy-policy` and `/terms` are no longer coded: they are `content/pages/<slug>.json` (home = `home`), rendered by the root optional catch-all `pages/[[...slug]].tsx` and edited like posts (`/admin`, or append `/edit` to the URL). Same model as `~/Documents/GitHub/yj-portfolio`: no database, no login, publish = commit and push.

- Don't re-create a coded page for marketing content — add or edit a JSON page. `/blog` (index), `/login`, `/profile`, `/social`, `/invite`, `/verify`, the other `pages/admin/*` tools and every game API stay coded.
- Adding a coded route? Add its first URL segment to `RESERVED_PAGE_ROOTS` in `lib/blog/site.ts`, or a JSON page could be created underneath it.
- Pages and posts share everything (`lib/blog/content.ts` functions take `kind: "post" | "page"`; the admin API takes `kind` too). The home look comes from blocks — Animated title, Latest posts, the image background's fade/parallax, the `meta.snow` toggle, and the "Site footer" mirror in `content/blog/site.json`.
- New block type = schema variant + atom + `atom-registry` entry + `MOBILE_OVERRIDABLE_KEYS` entry; give it a `SCHEMA_FORM_BLOCKS` entry in `PropertiesPanel.tsx` for a generated form, and `grows: true` if its height depends on content.

## Future tasks

- `/blog` (the post index) is still coded. With the Latest posts block (count 0 = all) it could become `content/pages/blog.json`; it would need the `Blog` JSON-LD from `BlogSeo` kept for that slug and `blog` removed from the reserved list for the exact path only.
