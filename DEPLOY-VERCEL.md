# Deploying to Vercel + Supabase (FREE)

The website is now a **full-stack app** ready for Vercel. The old GitHub Pages
static site keeps running untouched until the new one is live and verified.

---

## Part 1 — What YOU do once (10 minutes, both free)

### A. Supabase (database + media storage)

1. Go to **https://supabase.com** → **Start your project** → **Continue with GitHub**.
2. Create a new project:
   - Name: `muhanad-portfolio`
   - Database password: click **Generate** and **save it somewhere** (needed below)
   - Region: closest to you (e.g. Frankfurt / London)
   - Plan: **Free**
3. While the project initializes, create the storage bucket:
   - Left sidebar → **Storage** → **New bucket** → name it exactly `media`
   - **Toggle ON "Public bucket"** → Create.
4. Get the connection info (three things to send back):
   - **Project URL**: ⚙ Project Settings → **Data API** → Project URL
     (looks like `https://abcd1234.supabase.co`)
   - **service_role key**: same page → `service_role` (secret) → click reveal & copy
   - **Database connection string**: top bar **Connect** button → choose the
     **Direct connection** string (port 5432), replace `[YOUR-PASSWORD]`
     with the database password you saved in step 2.
     (looks like `postgresql://postgres:PASSWORD@db.abcd1234.supabase.co:5432/postgres`)

### B. Vercel (hosting)

1. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Approve Vercel's GitHub access when asked (give it access to the
   `muhanad-portfolio` repository).
3. That's it for now — tell me your Vercel username/team name so I can finish
   the deployment from here (or click **Add New Project** → import
   `muhanad-portfolio` and just press Deploy; I'll set the env vars).

---

## Part 2 — What I do after you send the credentials

1. Save the three Supabase values into the project `.env` (gitignored).
2. Compress the 5 videos that exceed Supabase's 50 MB free upload limit
   (ffmpeg, 720p H.264 — visually near-identical).
3. Run the migration:
   - `npm run migrate:supabase -- --db` → copies ALL database content
     (projects, blog, testimonials, services, skills, CV, messages, ratings,
     site content, admin account) to Supabase.
   - `npm run migrate:supabase -- --media` → uploads all media to Supabase
     Storage (deduped) and rewrites the database URLs to the new storage URLs.
4. Deploy to Vercel with all environment variables set.
5. Set `NEXT_PUBLIC_SITE_URL` to the new `*.vercel.app` domain.
6. Full acceptance test of the live site + admin panel.

## Part 3 — Cutover

Once you're happy with the Vercel site:
- GitHub Pages site is retired (Settings → Pages → disable, or leave it — it
  will simply stay as an old snapshot).
- Local development switches to the Supabase database, so local and live
  always show the same content.

---

## Free plan limits (what we fit into)

| Resource | Free limit | Our usage |
|---|---|---|
| Supabase database | 500 MB | ~1 MB ✅ |
| Supabase storage | 1 GB | ~590 MB after dedupe+compress ✅ |
| Supabase bandwidth | 5 GB/month | fine for a portfolio |
| Vercel hosting | 100 GB bandwidth/month | fine |
| Vercel serverless functions | included on Hobby | contact form, admin, uploads |
