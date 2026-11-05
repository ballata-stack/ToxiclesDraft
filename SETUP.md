# Launch Toxicles on Vercel

## 1. Upload to GitHub

1. Extract toxicles-vercel.zip.
2. Create a GitHub repository.
3. Upload the **contents of the toxicles-vercel folder**. package.json, app, public and supabase must be at the repository root.
4. Include .gitignore and .env.example. Do not upload node_modules or a filled .env.local file.

## 2. Deploy the public portfolio

In Vercel, choose **Add New → Project**, import the repository, keep **Framework Preset: Next.js** and the default Output Directory, then deploy.

The portfolio, supplied photos, merch links and map work immediately. Admin editing and booking submission need the setup below.

## 3. Create the backend

In a Supabase project's **SQL Editor**, run these files in order:

1. **supabase/schema.sql** — content, approved admins, public media and access policies.
2. **supabase/bookings.sql** — private booking requests, reference photos and submission limits.
3. **supabase/first-admins.sql** — replace example emails with the intended Google email addresses, uncomment the INSERT and run it.

Include every initial primary admin you want. The schema grants no admin access by default. The first two scripts can be rerun when adding bookings to an existing project.

## 4. Enable Google sign-in

1. In Supabase, open **Authentication → Sign In / Providers → Google** and copy its callback URL.
2. In Google Cloud, create a **Web application** OAuth client.
3. Add the Supabase callback as an **Authorized redirect URI**. Use your Vercel origin as an authorized JavaScript origin if asked.
4. Configure the consent screen. In testing mode, add all approved admins as test users.
5. Enter the Google Client ID and Client Secret in **Supabase's Google provider settings**, then enable Google.
6. In Supabase **Authentication → URL Configuration**, set **Site URL** to your Vercel origin.
7. Add https://YOUR-VERCEL-DOMAIN/auth/callback to the allowed redirect URLs. For local development, add http://localhost:3000/auth/callback.

| Setting | URL |
| --- | --- |
| Google Cloud → Authorized redirect URI | Callback copied from Supabase's Google provider panel |
| Supabase → Allowed redirect URLs | Your Vercel origin followed by /auth/callback |

Use the actual domains with HTTPS. Add a custom domain's callback if you switch later.

## 5. Add Vercel environment variables

Copy the values from Supabase's project API settings:

| Variable | Value | Visibility |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Public |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase publishable key | Public; database policies restrict access |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service-role key | **Server only; needed for booking submissions** |

Set them in **Vercel → Project → Settings → Environment Variables**, select Production and redeploy. Configure stable Preview deployments separately if used.

Never expose the service-role key through a NEXT_PUBLIC_ name, GitHub, a public file or a client component. The Google Client Secret belongs only in Supabase's Google provider settings.

For local development, copy .env.example to .env.local and fill in the same values.

## 6. Open the private editor

Visit https://YOUR-VERCEL-DOMAIN/admin, choose **Continue with Google**, and select an approved account.

| Editor section | What it changes |
| --- | --- |
| Brand | Logo, optional wordmark, tagline and public links |
| Tattoo Book | Completed tattoos and book/gallery order |
| Flash Designs | Images, availability and prices; no subcategories |
| Artworks | Paintings & Drawings / Objects, cover photos and extra galleries |
| The Studio | Studio photos, preparation video, poster, address and map |
| Shop | Original Artworks / Prints / Merch, prices, sizes, stock, links and extra photos |
| On the Road | Events, dates, venues, photos and links |
| FAQ | Questions, answers and order |
| Booking requests | Private requests, photos and New / Contacted / Closed statuses |
| Admin access | Approved Google emails; primary admins remain protected |

Choose **Save changes** to publish content edits. The first save stores the bundled content. Later deployments keep that saved version. If another admin saves first, reload and reapply your draft.

### Import photos into an already-saved website

If you have never saved content through the editor, the supplied photos appear automatically.

If you have saved an earlier version:

1. Deploy this updated code and its public/images/uploads folder.
2. Finish any open admin drafts.
3. Review and run **supabase/import-current-photos.sql** in Supabase's SQL Editor.
4. Reload the website and editor.

The script adds missing supplied flash/artwork photos, groups the helmet/cat galleries and replaces the older bundled copies of the same flash images. It moves the old bundled Skull & Swallow image into Artworks. It preserves other uploaded content, settings, prices, products, events and memberships. Rerunning it does not duplicate photos. It increments the content revision if the merge changes saved data.

## 7. Check the live site

- Test the public pages, carousel controls and tattoo book on desktop and a phone.
- Sign into /admin, save a small change, and check it in a separate public browser window.
- Submit a test booking with a reference photo. Open Booking requests, view the photo and change its status.
- Confirm an unapproved Google account cannot access the editor or booking data.

**No automatic booking email notification is sent.** Admins must check the inbox and contact clients. Preferred dates/times are requests, not confirmed appointments. References are private; viewing links expire after an hour, so use Refresh to renew them.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Admin setup is pending | Add both public Supabase variables and redeploy. |
| Booking submission is disabled | Add all three variables and redeploy. |
| Booking cannot save | Run bookings.sql; check the URL and server-only key belong to the same project. |
| Google redirect mismatch | Compare both redirect settings in step 4. |
| Google blocks a test user | Add the admin as a consent-screen test user or publish the OAuth app. |
| Account is not approved | Check the exact email in studio_admins and choose that account. |
| Photos stay old after redeploy | Saved content takes precedence; use the optional import SQL. |
| Public content cannot load | Run schema.sql and check the URL/publishable key. Backend errors do not overwrite saved content. |
| Another admin saved | Reload, then reapply and save your intended edits. |
| Private reference link expired | Refresh the booking inbox. |
| Too many booking requests | Wait before retrying; submissions are limited to five per hour per network fingerprint. |

## Reference links

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
