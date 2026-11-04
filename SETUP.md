# Launch Toxicles on Vercel

## 1. Upload to GitHub

1. Extract `toxicles-vercel.zip`.
2. Create a GitHub repository.
3. Upload the **contents of the `toxicles-vercel` folder**. `package.json`, `app`, `public`, and `supabase` should be at the repository root, rather than inside another project folder.
4. Include `.gitignore` and `.env.example`. Do not upload `node_modules` or any real `.env.local` file.

## 2. Deploy the public website

1. In Vercel, choose **Add New → Project** and import the repository.
2. Keep **Framework Preset: Next.js**. Leave the Output Directory at its default.
3. Deploy. The gallery, merch, video placeholder, events and map work immediately.

The admin page remains locked until the following setup is complete.

## 3. Create the content backend

1. Create a Supabase project.
2. Open its **SQL Editor** and run all of `supabase/schema.sql`.
3. Open `supabase/first-admins.sql`. Replace the example emails with the approved **Google account email addresses**, uncomment the INSERT, and run it in the SQL Editor.
4. Include every initial primary admin you want. This grants editing access, so use the exact intended addresses.

The schema creates the content table, admin list, media bucket, and access policies. It does not grant anyone access by default.

## 4. Enable Google sign-in

1. In Supabase, open **Authentication → Sign In / Providers → Google**.
2. Copy the callback URL shown there.
3. In Google Cloud, create a **Web application** OAuth client. Add the exact Supabase callback URL as an **Authorized redirect URI**. Use your Vercel site origin as an authorized JavaScript origin if the Google configuration asks for one.
4. Configure the OAuth consent screen. If the Google app is in testing mode, add all approved admins as test users.
5. Put the Google Client ID and Client Secret in the **Supabase Google provider settings**, then enable Google. Keep other sign-in providers disabled unless you deliberately add support for them.
6. In Supabase **Authentication → URL Configuration**, set the **Site URL** to your Vercel website origin.
7. Add your exact `https://YOUR-VERCEL-DOMAIN/auth/callback` to Supabase's allowed redirect URLs. For local development, also add `http://localhost:3000/auth/callback`.

There are two different redirect settings:

| Setting | URL to put there |
| --- | --- |
| Google Cloud → Authorized redirect URI | The callback copied from Supabase's Google provider panel |
| Supabase → Allowed redirect URLs | Your Vercel domain followed by `/auth/callback` |

Use the actual domains, with matching spelling and HTTPS. Add a custom domain's callback too if you switch domains later.

## 5. Add two Vercel environment variables

Copy the project URL and publishable key from Supabase's project API settings:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key |

Add them in **Vercel → Project → Settings → Environment Variables**, select Production, and redeploy. If you enable a stable Preview domain, configure its redirect URL and environment variables too.

These public values are protected by the database policies. Do not use the service-role or secret key here. The Google Client Secret belongs in Supabase's provider settings, not in GitHub or browser code.

## 6. Open the editor

Visit `https://YOUR-VERCEL-DOMAIN/admin`, choose **Continue with Google**, and select an approved account.

- **Brand & video:** replace the emblem or wordmark and add the preparation film.
- **Flash designs / Tattoo gallery:** upload, remove, reorder and describe artwork. Tattoo gallery changes also update the portfolio book below the video.
- **Events:** add dates, venues, images and event links.
- **Merch:** update products, prices, sizes, stock labels, shop links and extra photos.
- **Studio & links:** change the map pin, embed URL, address and contact links.
- **Admin access:** add or remove other approved Google emails. Access changes take effect immediately.

Choose **Save changes** to publish content edits. The first save stores the bundled content as the shared version. Later deploys keep that saved content. If two admins edit at the same time, a stale save is rejected rather than overwriting the newer changes.

## If something needs fixing

| Symptom | Check |
| --- | --- |
| Admin setup is pending | Add both Vercel variables and redeploy. |
| Google shows redirect mismatch | Compare the two redirect settings in step 4. |
| Google blocks a test user | Add the admin to the Google consent screen's test users, or publish the OAuth app. |
| Account is not on the admin list | Check the exact email in `studio_admins`, and use the intended Google account. |
| Gallery cannot load after configuration | Run `schema.sql` and check the Supabase project URL/key. Existing content is not silently replaced with defaults after a backend error. |
| Upload is rejected | Check admin access, the bucket policies, file type, and the size limit. |
| Another admin saved changes | Keep a copy of your intended edits, reload the page, then reapply and save. |

## Official references

- [Deploying Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
