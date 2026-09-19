# Thang Backend

Backend services for the Thang game, built with Next.js, Firebase Authentication, and MongoDB.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20.9+ (Next 16 refuses to start on anything older)
- MongoDB Atlas Account
- Firebase Project

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following keys:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (Secret)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Database
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_DB_NAME=game

# Steam (Optional)
STEAM_WEB_API_KEY=...
```

**PIE Dev Login:** When running in development (`npm run dev`), the `/api/auth/dev-login` endpoint is enabled. Used by Unreal PIE "Dev Login" button. Run `npm run create-dev-users` once to create dev accounts (`helloworld1@gmail.com`..`helloworld10@gmail.com`, password: `12345678`). **Enable Email/Password sign-in** in Firebase Console → Authentication → Sign-in method.

### 4. Run Development Server

```bash
npm run dev
```

---

## ✍️ Blog & editor

The whole marketing site — the home page, `/download`, `/brand`, `/privacy-policy`, `/terms` and every blog post — is built in a Squarespace-style block editor (ported from `yj-portfolio`) and it works exactly like the portfolio does: **no database, no login.** Pages and posts are JSON files committed to this repo, uploaded media lives in `public/uploads/blog`, the editor only runs on your own machine under `npm run dev`, and **publishing is `git commit && git push`** — Vercel rebuilds the site from the files.

### Accessing admin mode

There is no login and there is no admin on the deployed site. The editor only exists on a machine that is running the dev server:

1. `npm install` (first time), then `npm run dev`.
2. Open **http://localhost:3000/admin** — the list of site pages and blog posts. Use `localhost`, not the Network URL Next prints: the admin API only answers same-machine, same-origin requests.
3. Shortcut: append `/edit` to any page or post URL to open it in the editor — `http://localhost:3000/download/edit`, `http://localhost:3000/blog/<slug>/edit`, and `http://localhost:3000/edit` for the home page.

In production every `/admin/**` and `/api/admin/**` URL is a 404, so nothing needs protecting — whoever can push to the repo can publish.

### Routes

| Route | What |
|---|---|
| `/`, `/download`, `/brand`, `/privacy-policy`, `/terms`, … | Site pages — `content/pages/<slug>.json` rendered by the root catch-all `pages/[[...slug]].tsx` (`home.json` is `/`). Create a new one at any free URL from the admin |
| `/blog` | Post index (coded) |
| `/blog/<slug>` | A post — exactly the block canvas designed in the editor, with no site header or footer around it (slugs may contain `/` folders, e.g. `patch-notes/0-1`) |
| `/blog/feed.xml` | RSS 2.0 feed |
| `/sitemap.xml`, `/robots.txt` | Crawler plumbing (generated on request) |
| `/admin` → `/admin/blog` | Pages & posts list — create, duplicate, publish/unpublish, delete (**local `next dev` only**) |
| `/admin/pages/edit/<slug>`, `/admin/blog/edit/<slug>` | The block editor for a site page / a post (local only) |
| `/admin/pages/preview/<slug>`, `/admin/blog/preview/<slug>` | Draft preview — renders the saved page with a "not public" banner (local only) |
| `/api/admin/blog/*` | Admin API — reads and writes the files below (`kind: "page"` selects `content/pages`); a 404 in every production build |

`/login`, `/profile`, `/social`, `/invite`, `/verify`, the other `pages/admin/*` tools and every game API are still coded. A site page can't be created under one of those URLs — `RESERVED_PAGE_ROOTS` in `lib/blog/site.ts` lists them; add to it when you add a coded route.

### Where the content lives

Everything is a plain file and everything is committed to git:

- `content/pages/<slug>.json` — one file per site page, same shape as a post. `home.json` renders at `/`, everything else at `/<slug>` (`guides/controls.json` → `/guides/controls`). Only `title`, `description`, the share image, `published` and `snow` in `page.meta` matter for a page; an unpublished page is a public 404.
- `content/blog/posts/<slug>.json` — one file per post: `{ "page", "createdAt", "updatedAt", "publishedAt" }`, where `page` is validated against `lib/blog/schema.ts` and `page.meta.published` decides whether the post is public. A slug with `/` folders becomes nested directories (`patch-notes/0-1` → `content/blog/posts/patch-notes/0-1.json`). Slugs are lowercase `a-z 0-9 -`, max 120 characters.
- `content/blog/site.json` — the tag and mirror libraries, `{ "tags": [...], "mirrors": [...] }`, shared by pages and posts. Optional: schema defaults apply while the file is missing. It ships with one mirror, **Site footer** (`mir_footer`): the home and download pages each place an instance, so editing the footer's links on either changes both.
- `public/uploads/blog/images/` and `public/uploads/blog/videos/` — uploaded media, served from the same origin at `/uploads/blog/images/<name>` and `/uploads/blog/videos/<name>` (created by the first upload).

Files are written with 2-space indentation and a trailing newline so diffs stay small and reviewable. Hand-editing is fine; a file that fails validation fails `next build` (and the dev render) loudly rather than silently vanishing from the site. `content/blog/posts/welcome-to-thang.json` is the sample post that ships with the repo.

### Writing a post (local only)

```bash
npm run dev          # then open http://localhost:3000/admin — see "Accessing admin mode" above
```

The editor and its API exist only under `next dev`. Production builds hard-wire `/admin/blog/**` and `/api/admin/blog/*` to a 404 (the same `NODE_ENV === "development"` gate as the portfolio's `src/proxy.ts`), so there is no password, no allow-list and no session: push access to the repo is the auth boundary. Create, edit, upload and publish in the browser — every action writes the files above — then commit and push:

```bash
git add content               # site pages, posts + site config
git add public/uploads/blog   # uploaded media — this folder only exists after your first upload; skip the line until then
git commit -m "blog: <post title>"
git push
```

Vercel builds the pushed commit and the post is live. Unpublished drafts are committed too; they simply render a 404 publicly, and `/admin/blog/preview/<slug>` shows them locally.

Pages and posts are WYSIWYG: the public page renders only the block canvas — there is no site header, hero or footer around it. Put the title in a Text block with the `h1` variant (the "Post header" section template does this) and add any nav or footer as blocks, or as a shared mirror (the Site footer) so every page picks it up. The one thing outside the canvas is the falling snow, a toggle in the Page/Post panel.

### Blocks that came from the coded pages

Turning the hand-built pages into editor pages added a few blocks that keep their look (each renders the matching classes from `styles/globals.css`): **Animated title** (the hero's letter-by-letter wordmark), **Latest posts** (published posts as cards — the posts are read at build time, not stored in the block), **Cards** (glass cards with icon / text / status pill), **Footer**, and the brand guide's **Font specimen** and **Color swatches**. A section's image background also gained **fade into page** and **parallax** — together with a screen-height section and the Animated title, that is the home hero.

On the public page, content-sized blocks (Text, Quote and the blocks above) may push their rows taller than the box drawn in the editor, moving everything below down — so long copy, a growing post grid or cards stacking on a phone never overlap the next block. Media and everything else stay locked to their box (`grows` in `lib/blog/atom-registry.ts`, `blockSizingStyle` in `components/blog/SectionRenderer.tsx`).

### Media uploads

`/api/admin/blog/upload` drops photos (up to 12 MB) and videos (up to 64 MB) into `public/uploads/blog/<images|videos>/<name>-<stamp>.<ext>`. They are served from the same origin, so `next/image` can optimize them, and they are committed to git like any other asset — which is why the caps are modest. Images are downscaled in the browser before upload. **For anything longer than a short clip, upload the video to YouTube and point the Video block at it** (`source: youtube`) instead of committing the file: the repo stays small and the visitor gets adaptive streaming.

### How publishing reaches the site

Every site page, `/blog` and `/blog/<slug>` are fully static — `getStaticProps` / `getStaticPaths` with `fallback: false` — and are prerendered at build time from the content files. There is no ISR and no on-demand revalidation: a new deploy is the only way a change reaches production, which is exactly what a push does. In `next dev` the same functions run on every request, so editor saves show up immediately. `feed.xml` and `sitemap.xml` are server-rendered on request with a 10-minute CDN cache; `next.config.js` traces `content/**` into those functions so the files exist on Vercel.

### Environment variables

The blog needs exactly one, and only for absolute URLs:

```env
# Absolute origin used in canonical URLs, Open Graph tags, RSS and the sitemap.
# No trailing slash. Falls back to https://$VERCEL_PROJECT_PRODUCTION_URL when that
# variable is present at build time (Vercel sets it), then http://localhost:3000.
# Read by next.config.js at startup — restart `next dev` after changing it.
NEXT_PUBLIC_SITE_URL=https://thang.gg
```

### Onboarding the designer

They need a clone of the repo, Node.js 20.9+ (Next 16), and push rights to `main`. `npm install && npm run dev`, then open `/admin/blog`. No accounts, no allow-list, no bucket to configure.

### Where the code lives

- `lib/blog/schema.ts` — the page/section/block schema (zod); `lib/blog/content.ts` — file persistence for `content/pages/**` and `content/blog/**` (pages, posts + site config; every function takes a `kind`); `lib/blog/uploads-store.ts` — writes and lists `public/uploads/blog`; `lib/blog/upload-limits.ts` — the size caps; `lib/blog/admin-auth.ts` + `lib/blog/admin-client.ts` — the dev-only gate (server and browser halves); `lib/blog/seo.tsx` — `<Head>` + JSON-LD for the public pages; `lib/blog/site.ts` — site name/URL helpers, `ContentKind`, page/post/editor paths and the reserved page URLs.
- `components/blog/` — the renderer (`PageRenderer`, `SectionRenderer`, `atoms/*`), the public chrome (`BlogCard`, `PostLayout`) and the editor (`editor/*`, plus `admin/EditorScreen` + `admin/PreviewScreen`, shared by the page and post routes).
- `pages/[[...slug]].tsx` (site pages), `pages/blog/**`, `pages/sitemap.xml.tsx`, `pages/robots.txt.tsx` — public pages; `pages/admin/blog/**`, `pages/admin/pages/**` + `pages/api/admin/blog/**` — admin (dev only).
- `content/pages/` — the site pages; `content/blog/` — the posts and site config; `public/uploads/blog/` — uploaded media (created by the first upload).
- `styles/blog.css` — Tailwind layer for the editor/renderer (scoped by the `tw-reset` class); the `/* --- blog --- */` section at the end of `styles/globals.css` — cards, post page chrome, tag chips.

---

## 📚 API Documentation

All endpoints require a Firebase ID Token in the Authorization header:
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

### Authentication & User Management

#### `POST /api/auth/bootstrap`

**Description:** Called by the web client after Firebase login. Creates the user in MongoDB if they don't exist.

- **Body:** None (uses token claims).

#### `POST /api/game/bootstrap`

**Description:** Called by the Unreal Engine game client. Authenticates user and returns initial game state.

- **Body:** None.
- **Response:**
  ```json
  {
    "user": { ... },
    "serverTime": "2025-01-01T00:00:00.000Z",
    "config": { "version": "1.0.0" }
  }
  ```

#### `GET /api/user/profile`

**Description:** Fetch the current user's profile data (coins, rank, inventory).

### Store & Economy

#### `POST /api/store/purchase`

**Description:** Purchase an item using coins.

- **Body:**
  ```json
  { "itemId": "item_sword_01" }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Purchased Basic Sword",
    "newBalance": 50,
    "item": { ... }
  }
  ```

---

## 🗄️ Database Schema (MongoDB)

### `users` Collection

Automatically created on first login.

```json
{
  "_id": "firebase_uid_string",
  "email": "user@example.com",
  "username": "PlayerOne",
  "coins": 100,
  "rank": 0,
  "inventory": [
    {
      "itemId": "item_sword_01",
      "name": "Basic Sword",
      "purchasedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

### `items` Collection

**IMPORTANT:** You must manually populate this collection for the store to work. Insert these documents into your `items` collection:

```json
[
  {
    "itemId": "item_sword_01",
    "name": "Basic Sword",
    "price": 50,
    "type": "weapon",
    "description": "A sharp steel sword."
  },
  {
    "itemId": "item_shield_01",
    "name": "Wooden Shield",
    "price": 40,
    "type": "armor",
    "description": "A sturdy wooden shield."
  },
  {
    "itemId": "potion_health",
    "name": "Health Potion",
    "price": 10,
    "type": "consumable",
    "description": "Restores 50 HP."
  }
]
```
