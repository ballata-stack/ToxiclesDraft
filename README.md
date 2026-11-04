# Toxicles

Traditional tattoo portfolio built with **Next.js**, ready for **GitHub → Vercel**.

- A realistic, swipeable tattoo portfolio book directly below the video. Hard covers, soft paper pages, turning shadows, desktop spreads and a phone layout. The book uses the admin-managed tattoo gallery.
- Flash, tattoo, and Goodbye Sunday merch carousels, with touch and keyboard controls.
- Optimized WebP images, smaller WOFF2 fonts, client-side navigation and a book engine that loads near the viewport. Reserved image and book space reduces layout jumps.
- Extra product photos in a carousel inside the product view.
- Subtly aged paper texture across a fluid, full-width layout, supplied three-horse logo, and an editable wordmark.
- A reserved top video area. It stays empty until an admin uploads the film.
- Events and merch pages, Instagram links, and the supplied studio map pin.
- Google sign-in with an approved-email admin list.
- Shared content and uploads stored in Supabase, rather than Vercel's temporary filesystem.

## Start here

Read **[SETUP.md](./SETUP.md)** for the deployment steps. The public website works before Supabase is configured; the editor stays locked until setup is complete.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`.

```sh
npm run typecheck
npm test
npm run build
```

Node.js 22.13 or later is required. Vercel detects this as a Next.js project. `vercel.json` uses `npm ci` and `npm run build`.

## Admin editor

Visit `/admin`. Only verified Google accounts in `studio_admins` can edit the site. Add the first primary admin emails using the Supabase SQL editor. Those admins can add or remove other admins in the editor. Public visitors do not need an account.

Admins can replace the logo, wordmark, video, cover image, artwork and tattoo photos; add product photos; edit prices, availability, sizes, events, links, and the studio map. Edits are drafts until **Save changes** is selected. A revision check rejects a stale save if another admin has changed the content.

Images support JPG, PNG, WebP and GIF up to 12 MB. Videos support MP4 and WebM up to 40 MB, or a direct HTTPS URL. Uploads go directly to the protected media bucket. Files removed from a gallery stop appearing on the site; existing stored bytes remain in the bucket until removed through Supabase Storage.

## Included content

Merch photography is from the supplied Goodbye Sunday Instagram account. The website links to its official Shopee shop. Product names are short descriptive labels. Prices, sizes and current stock have not been guessed; the initial cards direct visitors to the shop. Admins can enter confirmed values later. This is an imported selection, not an automatic Instagram feed.

The studio map targets the exact **TOX Tattoo Studio** business listing from [the supplied Google link](https://maps.app.goo.gl/dC8FULo3jpLNYU9T7). Its Google Maps CID is `10933773881425842630`, at **14.5261084, 121.0413411**. The displayed address is **Unit A, Phase 4 AFPOVAI, 8 Llanera Street, Taguig, 1630 Metro Manila**. Admins can edit the shared link and the embed URL; clearing the embed URL uses the map search field.

All source links are listed in [CONTENT-SOURCES.md](./CONTENT-SOURCES.md). Font licenses are in `public/fonts/`. No stock tattoo work or invented product mockups are used in the initial galleries.

## Architecture

- Next.js App Router on Vercel; standard npm scripts and `package-lock.json`.
- Supabase Google OAuth with PKCE and server-verified user identity.
- PostgreSQL row-level security for admin membership, content and uploads.
- Atomic content-save function with optimistic revisions.
- Same-origin checks for write and sign-out endpoints.
- Public, read-only gallery access. There is no service-role key in this project.

The ChatGPT-hosted preview is separate from this portable project. This version has no ChatGPT login requirement or Cloudflare-specific runtime dependencies.

## Verification status

The production build and the PostgreSQL access/data tests pass. The tests run the actual RLS policies, save functions, membership rules, upload policy and server request guards against isolated fixtures. The page layout was inspected in the browser, and the shared flipbook renderer was separately checked with working page turns. This preview environment did not initialize Next.js browser interactions, including a minimal diagnostic page, so full interactive browser verification remains to be completed on Vercel. Live Google OAuth also needs the Supabase and Google configuration described in `SETUP.md` before it can be verified.
