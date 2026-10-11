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

- [x] **Public website hosted on GitHub Pages**
      (https://arccy1.github.io/muhanad-portfolio/ — redeploy after content edits
      with `deploy-pages.bat`; admin panel + inbox keep running locally)
- [x] **Credentials rotated** — real admin login (your Gmail) + a strong password +
      a fresh `AUTH_SECRET`; stored in `.env` (never committed). Login page no
      longer shows any hints.
- [x] **PostgreSQL** — portable PostgreSQL 16 installed at `C:\Users\mohan\pgsql`,
      all content migrated from SQLite, `start.bat` starts it automatically.
      (Original SQLite kept as backup: `prisma/data-backup.json`.)
- [ ] **Custom domain** (needs your purchase): add it in repo Settings → Pages,
      then set `NEXT_PUBLIC_SITE_URL` in `.env` and the
      `NEXT_PUBLIC_BASE_PATH`/sitemap constants in `scripts/build-static.mjs`
      to "" (root domain hosting)
- [ ] Optional: a VPS deployment if you want the contact inbox + admin online 24/7
      (`npm run build && npm start` behind nginx/Caddy)
- [ ] Add the site to Google Search Console and submit `/sitemap.xml`
      (needs your Google account — verify ownership, then submit the sitemap URL)

## Phase 3 — Hardening & Operations

- [x] **Rate limiting** — login (5/15 min per IP), contact form (5/hour per IP),
      uploads (30/hour per IP); in-memory, resets on server restart
- [x] **Contact-form honeypot** — bot submissions are silently discarded
- [x] **Security headers** — CSP, X-Frame-Options, nosniff, Referrer-Policy,
      Permissions-Policy on the full-stack server
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
