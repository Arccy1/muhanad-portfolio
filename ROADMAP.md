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
- [x] **Email notifications** — implemented via SMTP (nodemailer). To activate:
      create a Gmail App Password (myaccount.google.com/apppasswords) and fill
      `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` + `NOTIFY_EMAIL` in `.env`. Without
      credentials the contact form still works, just without emails.
- [x] **Automated database backups** — daily Windows scheduled task at 21:00
      ("MuhanadPortfolio DB Backup") runs `npm run db:backup` (pg_dump) into
      `/backups`, keeping the last 30. Manual: `npm run db:backup`.
      Restore with: `pg_restore -U postgres -d muhanad_portfolio <file>.dump`
- [x] **Password self-service** — change password + profile email/name directly
      in Admin → Dashboard. Additional admin accounts:
      `npm run admin:add -- "email" "password" "Name"`
- [x] **Error tracking + cookieless analytics (local)** — unexpected errors log
      to `logs/error.log` (client errors included via the global error
      boundary); page views are recorded in the database and shown in
      Admin → Dashboard ("Site Traffic"). For analytics of the live
      GitHub Pages site, add Plausible later (needs an account).
- [ ] Optional: migrate these to hosted services (Sentry/Plausible) if the
      backend moves online

## Phase 4 — Site Growth

- [x] **Portfolio search + pagination** — live search over titles/clients/tags/software
      plus 9-per-page pagination with page controls on the public portfolio page
- [x] **Project case-study blocks** — per-project client quote and results/metrics
      (editable in Admin → Projects → Case Study; rendered as metric cards + a
      verified-feedback quote on the project page)
- [x] **Start-a-project wizard** — /start: 3-step guided brief (service + budget →
      details → attachments) with file uploads (10 MB, PDF/Word/images/ZIP,
      rate-limited) that arrive as links in the contact inbox; on the live
      GitHub Pages site it hands off to a pre-filled email instead
- [x] **Blog** — Admin → Blog (write/edit/publish posts, cover images, read time)
      + public /blog list and /blog/<slug> post pages with headings/paragraphs
      rendering, wired into the nav, footer and sitemap
- [x] **Arabic / English bilingual UI** — globe toggle in the navbar (EN / عربي):
      full interface translation + RTL layout, persisted per visitor. DB content
      (projects, services, posts) displays in the language you author it in —
      type Arabic versions in the admin and they show as-is
- [x] **Seasonal accent variations** — Admin → Site Content → "Seasonal accent":
      switch the whole brand hue (Blue / Teal / Purple / Gold / Rose) in both
      themes; subtle by design — layout stays identical

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
