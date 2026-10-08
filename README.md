# Muhanad Wael Mahdy — Portfolio

A cinematic, full-stack portfolio website for a video editor & motion designer.
Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Prisma**.

Dark red + black visual identity, animated particle hero, categorized portfolio with
before/after grade comparisons, a working contact inbox, and a complete admin dashboard
for managing every piece of content on the site.

| Document | Purpose |
| --- | --- |
| **README.md** (this file) | Setup, login, running, deploying |
| **AGENTS.md** | Guide for AI agents & contributors working on the code |
| **ROADMAP.md** | What to do next, in order |

---

## Quick Start (easiest way)

Double-click **`start.bat`** in the project folder. On first run it installs
dependencies and creates + seeds the database automatically, then starts the site and
opens your browser at http://localhost:3000.

Keep the black console window open while using the site — closing it stops the website.

> Requires Node.js 18+ on PATH. On this PC a portable Node v22 is installed at
> `C:\Users\mohan\nodejs` (already on the user PATH).

## Manual Setup (any machine)

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create your environment file from the template, then edit it
#    (Windows) copy .env.example .env
cp .env.example .env

# 3. Create and seed the database (demo content + admin user)
npm run db:push
npm run db:seed

# 4. Run
npm run dev          # development — http://localhost:3000
# or
npm run build        # production build
npm start            # serve the production build
```

> **Windows note:** stop the dev server before running `npm run build` — the running
> server locks Prisma's engine DLL and the build fails with `EPERM`.

## Environment Variables (`.env`)

Copy `.env.example` and adjust. Every variable is documented inside the template:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file (default) or PostgreSQL connection string |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Admin credentials applied by `npm run db:seed` |
| `AUTH_SECRET` | Secret used to sign admin session tokens — **set a long random string in production** |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for SEO metadata and sitemap |

## Admin Dashboard — Login

- **URL:** http://localhost:3000/admin
- **Email:** `admin@muhanad.dev`
- **Password:** `admin123`

Visiting `/admin` while logged out redirects to the login page automatically
(credentials are also shown there as a reminder while in demo mode).

**Change the credentials before going live:** edit `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env`, then re-run `npm run db:seed` (this resets demo content, so do it before
adding real projects).

### What the dashboard manages

| Section | Capabilities |
| --- | --- |
| **Dashboard** | Live counts and recent activity |
| **Projects** | Full CRUD with thumbnail/video/gallery/before-after uploads, category, software, process steps, client info, featured & published toggles — plus **search + category/year/status filters** |
| **Categories** | Portfolio categories and subcategories |
| **Testimonials** | Client quotes with avatars and ratings |
| **Messages** | Contact-form inbox — unread states, mark read, reply by email, delete |
| **Site Content** | Hero text, stats, showreel video, about text & photo, CTA, all social links |

---

## Database

Ships configured for **SQLite** (`prisma/schema.prisma`, `provider = "sqlite"`) so it
runs anywhere with zero setup. Data lives in `prisma/dev.db` (gitignored).

### Switching to PostgreSQL (recommended for production)

1. Start Postgres — a ready-made instance is included:

   ```bash
   docker compose up -d
   ```

2. In `prisma/schema.prisma` change the datasource provider to `"postgresql"`.
3. In `.env` set:

   ```
   DATABASE_URL="postgresql://muhanad:muhanad_secret@localhost:5432/muhanad_portfolio?schema=public"
   ```

4. Recreate and seed:

   ```bash
   npm run db:push
   npm run db:seed
   ```

The schema avoids provider-specific features (JSON columns are stored as JSON strings)
so it works identically on both databases.

---

## Project Structure

```
prisma/
  schema.prisma              # AdminUser, Category, Project, Service, Skill,
                             # Testimonial, ContactMessage, SiteContent
  seed.ts                    # demo content + admin user
  placeholder-manifest.json  # generated image map used by the seed
scripts/
  generate-placeholders.mjs  # generates all SVG placeholder art into public/images
src/
  middleware.ts              # protects /admin/* at the edge (JWT cookie)
  app/
    (site)/                  # public pages (share navbar/footer chrome)
      page.tsx               #   /            — hero, stats, marquee, featured,
                             #                  skills, showreel, testimonials, CTA
      portfolio/             #   /portfolio   — filterable grid
        [slug]/page.tsx      #   /portfolio/[slug] — player, process, before/after,
                             #                  gallery, related projects
      about/  services/  showreel/  contact/
    admin/
      login/                 # standalone login page
      (panel)/               # guarded dashboard + projects/categories/
                             # testimonials/messages/content
    api/                     # auth, projects, categories, testimonials,
                             # messages, content, upload, stats, services
    template.tsx             # page transition animation
    sitemap.ts  robots.ts  icon.svg
  components/
    home/  portfolio/  layout/  ui/  admin/  contact/
  lib/
    prisma.ts  auth.ts  jwt.ts  data.ts  content.ts
    projectPayload.ts  utils.ts  types.ts
public/
  images/                    # generated SVG placeholders (replace with real work)
  uploads/                   # admin-uploaded media (gitignored)
start.bat                    # one-double-click launcher (Windows)
```

## Key Features

- **Cinematic hero** — animated red particle canvas, optional background video, glow
  CTAs, scroll indicator, film-grain overlay.
- **Categorized portfolio** — six categories with animated filter pills; cards show
  thumbnail, category, duration, software and description.
- **Project pages** — large player (MP4/WebM upload or YouTube link), editing-process
  steps, draggable before/after grading slider, gallery lightbox, client info,
  related projects.
- **Admin** — bcrypt + JWT (httpOnly cookie), edge middleware guard, server-side
  session re-checks on every mutating route, media uploads, project filters.
- **Contact system** — validated public endpoint, admin inbox with unread states and
  one-click mailto replies.
- **Performance & SEO** — lazy-loaded media, metadata + OpenGraph, sitemap/robots,
  `prefers-reduced-motion` support, accessible labels and keyboard-operable sliders.

## Replacing the Demo Content

- **Images:** all placeholder art is generated by `npm run placeholders`
  (`scripts/generate-placeholders.mjs`). Replace files in `public/images`, or upload
  real thumbnails/videos through the admin panel.
- **Videos:** seeded projects use public sample videos. Swap each project's video URL
  in the admin editor, or set the showreel URL under *Admin → Site Content*.
- **Text, stats and social links:** *Admin → Site Content* — no code changes needed.

## Git & Pushing to GitHub

This folder is a git repository. To publish it to your own GitHub account:

1. Create an empty repository on [github.com/new](https://github.com/new)
   (don't add a README/license — this repo already has them).
2. From the project folder:

   ```bash
   git remote add origin https://github.com/<your-username>/muhanad-portfolio.git
   git push -u origin main
   ```

3. The first push will ask you to sign in to GitHub (browser window pops up).

`.env`, the database file, `node_modules`, and uploaded media are gitignored — the
repo contains everything else needed to run the site from scratch.

## Deploying

See **ROADMAP.md → Phase 2** for the production checklist (credentials, PostgreSQL,
media storage on serverless, domain). Short version:

- **VPS:** `npm run build && npm start` behind a reverse proxy — uploads to
  `public/uploads` persist on disk.
- **Vercel/serverless:** works, but move uploads to S3/Cloudinary first and use a
  hosted PostgreSQL (Neon/Supabase) — the upload route is one file to change.
