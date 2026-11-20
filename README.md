# Adel Saeed — Portfolio (Next.js)

A bilingual (Arabic / English), light & dark portfolio in a modern black-and-white style,
with a built-in editor to add, remove, reorder, hide and edit sections.

## Run it

```bash
npm install
cp .env.example .env.local     # then set ADMIN_PASSWORD and NEXT_PUBLIC_SITE_URL
npm run dev                    # http://localhost:3000
```

> Don't run `npm run build` while `npm run dev` is running — both use the `.next` folder
> and the dev server breaks (pages render but nothing is clickable). If that happens:
> stop the dev server, `rm -rf .next`, start it again.

## Languages and URLs

- English lives at `/en`, Arabic at `/ar`. Each is a separate, pre-rendered page, so
  search engines and link previews see the right language.
- Visiting `/` redirects to the language the visitor picked before (a `lang` cookie),
  otherwise to Arabic for Arabic browsers and English for everyone else (`middleware.ts`).
- The language button switches instantly and updates the URL without reloading.

## Editing the site

1. Open `http://localhost:3000/admin` (on the live site: `https://your-domain.com/admin`).
   There is no edit button on the public pages — only you know this address.
2. Enter the password from `ADMIN_PASSWORD` (in `.env.local`, which is git-ignored).
   After 5 wrong passwords an IP is blocked for 15 minutes.
   You stay logged in for 8 hours (a secure, http-only cookie); changing the password logs everyone out.
3. In edit mode you can:
   - **Add section**: choose a layout (Text, Timeline, Cards, Tag groups or List).
   - **Edit** any section: title (Arabic + English), layout, and its items.
   - **Move up / down**, **Hide / Show** (hidden sections stay in the file but visitors don't see them), **Delete**.
   - **Edit profile**: name, role, tagline, highlight badge, contacts, CV link.
   - **Save**: writes everything to `data/content.json` and refreshes the cached pages.
   - **Export / Import**: download or load the content as JSON.
   - **Exit** (last toolbar button): logs out and returns to the public site.

Every text field has an Arabic and an English box. If one is empty, the other language is shown as a fallback.

### Project screenshots

Put images in `public/projects/` (e.g. `public/projects/nomad.png`, 16:9 works best), then set the
card's **Image URL** to `/projects/nomad.png` in the editor (or the `image` field in `content.json`).
Images show in grayscale and turn to color on hover.

## Where things live

| Path | What it is |
| --- | --- |
| `data/content.json` | All site content (the editor reads and writes this) |
| `public/Adel_Saeed_CV.pdf` | CV served by the "Download CV" button |
| `app/[lang]/layout.tsx` | HTML shell, fonts, per-language SEO metadata |
| `app/[lang]/page.tsx` | The page + schema.org Person data |
| `app/[lang]/opengraph-image.tsx` | Social preview image (LinkedIn, WhatsApp, X…) |
| `app/[lang]/icon.svg` | Favicon |
| `app/sitemap.ts`, `app/robots.ts` | `sitemap.xml` and `robots.txt` |
| `app/globals.css` | Design tokens (both themes) and all styles |
| `components/SectionView.tsx` | How each section layout renders (incl. clickable project cards) |
| `components/Contact.tsx` | Closing contact section |
| `components/editor/*` | The editor UI |
| `lib/i18n.ts` | Interface strings in Arabic and English |
| `lib/rateLimit.ts` | Failed-login limiter |

## Deploying (Cloudflare Pages — static)

`npm run build` produces a **static site in `out/`**. The editor, login/save API and the
language middleware are dev-only files (`*.dev.ts`, `*.dev.tsx`) and are left out of it.

**Workflow:** edit at `http://localhost:3000/admin` (`npm run dev`) → **Save** → commit and push
`data/content.json` → Cloudflare rebuilds the site.

Cloudflare Pages settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | *(empty)* |
| Env var `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.pages.dev` (or your domain) |
| Env var `NODE_VERSION` | `20` |

`public/index.html` sends `/` to `/en` or `/ar`; `public/_headers` sets content types and caching.
To preview the export locally: `npm run build && npx serve out`.
Don't run `npm run build` while `npm run dev` is running (they share `.next`).
