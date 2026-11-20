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

## Deploying

Set `NEXT_PUBLIC_SITE_URL` to the real domain — canonical links, the sitemap and social previews use it.

Saving writes to `data/content.json` on the server's disk. That works on any Node host
with a writable disk (VPS, Railway, Render with a disk, Docker).

On **Vercel** or other serverless hosts the disk is read-only, so Save will report that it
couldn't write. Workflow there: edit locally, press **Export**, replace `data/content.json`
in the repo with the exported file, and push. To save directly in production, swap
`readContent` / `writeContent` in `lib/content.ts` for a database (e.g. Supabase).
The login limiter is in-memory, so on serverless it only limits per instance.
