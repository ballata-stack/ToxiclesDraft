# Toxicles

Tattoo and artwork portfolio built with Next.js for **GitHub → Vercel**.

Homepage order: **Tattoo Book → Flash Designs → Artworks → The Studio → Shop → On the Road → FAQ**.

Tagline: **Traditional • Japanese • Custom Tattoos by Tox**

- Full-width aged ivory paper, the supplied three-horse logo, and the original blackletter style with a clearer lowercase k.
- Swipeable tattoo book and carousels with touch, keyboard and button controls.
- **48 supplied photos:** 13 flash designs and 26 artworks.
- Artworks filters: **Paintings & Drawings**, **Objects**. Flash has no subcategories.
- Each helmet and lucky cat has its own photo gallery. Photos open with a short fade and zoom, respecting reduced-motion preferences.
- Studio photos and the preparation video are reserved in **The Studio** until supplied.
- Shop filters: **Original Artworks**, **Prints**, **Merch**, including the Goodbye Sunday Frog tee.
- Editable events, FAQ, logo, wordmark, photos, video, prices, links and map.
- Booking form with the requested fields and up to four reference photos.
- Private booking inbox for approved Google admins, with New / Contacted / Closed statuses.

## Start and deploy

Read **[SETUP.md](./SETUP.md)** for deployment and backend setup.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Node.js 22.13 or later is required.

```sh
npm run typecheck
npm test
npm run build
```

The public portfolio works before Supabase is configured. Admin editing stays locked, and booking submission stays disabled with an Instagram contact link until its backend is configured.

## Admin editing

Visit /admin and choose **Continue with Google**. Only verified Google accounts on the approved-email list can edit or view bookings. Visitors see the normal website without a sign-in prompt.

Being signed into Google in the browser does not silently grant access. Admins sign in once through this website; their website session is then reused while valid. Multiple approved admins are supported.

Content changes publish when **Save changes** is selected. A revision check rejects stale saves. Admin access changes and booking-status updates take effect immediately.

Admin image uploads accept JPG, PNG, WebP and GIF up to 12 MB. Videos accept MP4/WebM up to 40 MB or a direct HTTPS URL. Files removed from the site remain in Supabase Storage until removed there.

## Bookings

Requests go to the private admin inbox. They do **not** automatically confirm appointments or send notification emails. Admins contact clients using the supplied details. Preferred times use Manila time.

Reference uploads accept four JPG/PNG/WebP files, each originally under 12 MB. The browser prepares smaller JPEG copies before sending them. References live in a private bucket; approved admins receive temporary viewing links.

The booking endpoint needs a **server-only SUPABASE_SERVICE_ROLE_KEY**. Never prefix it with NEXT_PUBLIC_, commit it to GitHub, or place it in browser code.

## Included content

Images are bundled locally, with smaller gallery thumbnails and larger detail images. This is an imported selection, not an automatic Instagram feed. See [CONTENT-SOURCES.md](./CONTENT-SOURCES.md).

Prices, sizes and stock have not been guessed. Admins can enter confirmed values; initial merch cards link to the official Goodbye Sunday shop. Studio photos, video, event dates and FAQ answers await the artist's content.

The footer uses the exact [TOX Tattoo Studio map link](https://maps.app.goo.gl/dC8FULo3jpLNYU9T7) and a mini map of the same business listing. Address: **Unit A, Phase 4 AFPOVAI, 8 Llanera Street, Taguig, 1630 Metro Manila**.

If the website already has saved Supabase content, redeploying preserves it. Use the optional **supabase/import-current-photos.sql** to merge the supplied photos into that saved version.

## Verification

Production build, TypeScript and database/API checks were run locally. Tests cover admin authorization, row-level security, shared saves, media access, private bookings, request validation, failed-upload cleanup and submission limits.

Actual React components were checked in an isolated browser fixture for category filters, grouped galleries and the opening animation. The complete Next.js preview did not hydrate reliably in this environment. Final checks of Google sign-in, shared persistence and live booking delivery need the configured Vercel deployment. Temporary fixtures and mock responses are excluded from the project.
