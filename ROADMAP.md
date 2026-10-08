# Road Map — What's Next

The site is fully functional today. This is the recommended order for turning it
from a great demo into a live, revenue-generating portfolio.

---

## Phase 1 — Real Content (highest impact, zero code)

- [ ] Replace the SVG placeholder thumbnails with real frames from your edits
      (Admin → Projects → edit each → upload thumbnail / gallery / before-after)
- [ ] Upload the real showreel (Admin → Site Content → "Showreel video URL" —
      YouTube link or MP4) and set a real background video for the hero (optional)
- [ ] Replace the profile photo (Admin → Site Content → "Profile image")
- [ ] Update all social links + email (Admin → Site Content → Contact & socials)
- [ ] Update stats to real numbers (same page)
- [ ] Collect 2–3 real testimonials from past clients and replace the demo ones
- [ ] Review all seeded projects: delete the ones that aren't yours, keep the rest

## Phase 2 — Production Launch

- [ ] **Change credentials**: set real `ADMIN_EMAIL` / `ADMIN_PASSWORD` and a long
      random `AUTH_SECRET` in `.env`, then re-run `npm run db:seed`
- [ ] **Switch to PostgreSQL** (see README → Database; `docker-compose.yml`
      included). SQLite is fine for local dev, PostgreSQL for production.
- [ ] **Media storage**: uploads currently go to `public/uploads` on disk — fine on
      a VPS, **not persistent on serverless (Vercel/Netlify)**. Move to S3 /
      Cloudinary / Bunny before deploying serverless (one file to change:
      `src/app/api/upload/route.ts`, plus the URL fields stay the same).
- [ ] Deploy:
  - *VPS (recommended for uploads + PostgreSQL):* `npm run build && npm start`
    behind nginx/Caddy, or a 5-line Dockerfile
  - *Vercel:* works, but requires the media-storage change above + a hosted
    Postgres (Neon/Supabase)
- [ ] Custom domain + HTTPS, and set `NEXT_PUBLIC_SITE_URL` in `.env` to it
- [ ] Add the site to Google Search Console and submit `/sitemap.xml`

## Phase 3 — Hardening & Operations

- [ ] Rate-limit `POST /api/messages` (e.g. 5/hour/IP) — spam protection
- [ ] Email notification when a contact message arrives (Resend / SendGrid /
      SMTP; hook into `src/app/api/messages/route.ts`)
- [ ] Automated database backups (pg_dump cron on VPS, or managed backups)
- [ ] Optional: second admin account or password reset flow
- [ ] Error tracking (Sentry) and basic analytics (Plausible/Umami — cookieless)

## Phase 4 — Site Growth

- [ ] Public portfolio search + pagination once projects pass ~30
- [ ] Project case-study blocks (client quotes per project, results/metrics)
- [ ] Services pricing tiers / "start a project" wizard with file uploads
- [ ] Blog or editing-breakdown series (great for SEO: "how I edited X")
- [ ] Arabic / English bilingual support (next-intl)
- [ ] Dark/red is the identity — optional subtle theme variations seasonally

## Phase 5 — Admin Quality-of-Life

- [ ] Bulk actions (publish/unpublish, delete selected)
- [ ] Drag-and-drop reordering for projects, testimonials and categories
- [ ] Media library (reuse uploaded assets across projects)
- [ ] Live preview of a project card while editing
- [ ] Draft preview link (share an unpublished project with a client)

---

### Suggested order for a freelance launch week

1. Phase 1 entirely (one focused evening)
2. Phase 2: credentials → PostgreSQL → deploy on a VPS → domain
3. First real test: submit the contact form, reply from the admin inbox
4. Ship the link in your bios; Phase 3+ as traffic grows
