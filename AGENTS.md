# AGENTS.md — Working Guide for AI Agents & Contributors

Everything an agent (or a new developer) needs to work on this codebase safely and
consistently. Read this before making changes.

## Project

Cinematic portfolio website for **Muhanad Wael Mahdy** (video editor & motion designer).
Full-stack: public site + admin dashboard + REST API + database.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Prisma (SQLite default, PostgreSQL-ready) · JWT auth (jose + bcryptjs).

## Commands

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build (prisma generate && next build)
npm start              # serve the production build
npm run db:push        # (re)create the database from prisma/schema.prisma
npm run db:seed        # reset + seed demo content and the admin user
npm run placeholders   # regenerate SVG placeholder art into public/images
npx tsc --noEmit       # type-check without emitting
```

Windows convenience: double-clicking **`start.bat`** runs the whole thing (first run
installs deps + creates/seeds the DB, then starts the dev server and opens the browser).

## Machine / Environment Notes (Windows)

- **Node.js** lives in `C:\Users\mohan\nodejs` (portable install, on the user PATH).
  If a shell can't find `node`, prefix commands with
  `set "PATH=C:\Users\mohan\nodejs;%PATH%"`.
- **Git** lives in `C:\Users\mohan\git\cmd` (portable MinGit, on the user PATH).
- The default shell is **cmd.exe** — no `head`/`tail`/`&&`-chains; use `&`, `dir`,
  `findstr`, or PowerShell one-liners.
- **CRITICAL:** stop the dev server (`next dev`/`next start`) **before** running
  `npm run build`. On Windows the running server locks Prisma's
  `query_engine-windows.dll.node` and the build dies with `EPERM ... rename`.
- The database file is `prisma/dev.db` (gitignored). Delete it + run
  `npm run db:push && npm run db:seed` for a clean slate.

## Architecture

```
src/app/
  (site)/          public pages — share Navbar/Footer chrome via layout.tsx
  admin/login/     standalone login page (no dashboard chrome)
  admin/(panel)/   guarded dashboard: projects, categories, testimonials,
                   messages, content  (route group = shared sidebar layout)
  api/             REST endpoints; every mutating route re-checks the session
src/components/    home/ portfolio/ layout/ ui/ admin/ contact/
src/lib/           the whole data layer — see below
prisma/            schema + seed + generated placeholder manifest
scripts/           generate-placeholders.mjs (SVG art generator)
public/images/     generated placeholder art (safe to replace with real media)
public/uploads/    admin-uploaded media (gitignored except .gitkeep)
```

### Data layer (`src/lib/`)

- `prisma.ts` — singleton client
- `auth.ts` / `jwt.ts` — session helpers; JWT in httpOnly cookie `mwm_token`
- `data.ts` — **all** server-side queries + `serializeProject()` DTO conversion.
  Pages never query Prisma directly; go through here.
- `content.ts` — `SiteContent` key/value store + `DEFAULT_CONTENT` fallbacks.
  Admin → Site Content edits these rows; the site merges them over defaults.
- `projectPayload.ts` — normalizes admin form bodies (arrays/objects ↔ JSON strings)
- `utils.ts` — `cn`, `slugify`, `parseJsonArray/Object`, `toJsonArray`

### Database design rule

Array/object fields (software, gallery, tags, process, beforeAfter, subcategories)
are stored as **JSON strings** so the same schema works on SQLite *and* PostgreSQL.
Never introduce provider-specific column types. Serialization happens once in
`data.ts` / API routes — components only ever see parsed arrays/objects.

### Auth flow

1. `POST /api/auth/login` verifies bcrypt hash, sets httpOnly JWT cookie (7 days)
2. `src/middleware.ts` blocks `/admin/*` at the edge (except `/admin/login`)
3. Every mutating API route calls `requireAdmin()` again — never rely on the
   middleware alone
4. The admin layout also checks `/api/auth/me` client-side for UX (not security)

### Design system

- Colors: `brand` scale (red, `#E50914` = brand-500) + `ink` (near-black) — see
  `tailwind.config.ts`. Never hardcode hex values in components.
- Headings: `font-display` (Bebas Neue) with `.heading-display` /
  `.heading-display` + `.text-gradient` (red gradient) utilities.
- Motion: shared `Reveal` component (scroll-triggered fade/slide) for consistency;
  respect `prefers-reduced-motion`.
- Icons: `lucide-react`. Service icons are stored in the DB by **icon name key**
  and mapped in `src/app/(site)/services/page.tsx` (`ICONS` map) — adding a new
  service icon means adding it to that map.
- Forms in admin use the shared `inputCls`/`labelCls` pattern already in each file.

## Conventions

- Public pages: **server components** fetch via `lib/data.ts` and pass DTOs to
  client components. Interactive pieces ("use client") stay small and focused.
- All public pages set `export const dynamic = "force-dynamic"` so admin edits
  appear immediately. Revisit only if caching becomes a priority.
- Images use plain `<img>` with `loading="lazy"` (SVG placeholders; no next/image
  optimization for them). Real raster media may switch to `next/image`.
- Accessibility: every interactive control gets an `aria-label`; sliders/tabs use
  proper ARIA roles (see `BeforeAfterSlider`, `PortfolioGrid`).
- Commits: imperative, scope-prefixed (e.g. `admin: add project filters`,
  `site: fix mobile nav overlap`).

## Admin access (dev defaults — change before deploying)

- URL: `http://localhost:3000/admin`
- Login: `admin@muhanad.dev` / `admin123`
- Credentials come from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and are applied
  by `npm run db:seed`. `.env` is gitignored; `.env.example` documents every var.

## Testing your changes

1. `npx tsc --noEmit` must pass (safe to run while the dev server is up).
2. Smoke the routes: `curl -s -o nul -w "%{http_code}" http://localhost:3000/`
   (expect 200 for `/`, `/portfolio`, `/about`, `/services`, `/showreel`,
   `/contact`, `/admin/login`; `/admin` should 307 to login when logged out).
3. Auth-sensitive checks: unauthenticated `POST /api/projects` must return 401;
   login then create/edit/delete a project through the admin UI.
4. Visual check in a real browser, desktop **and** 390px mobile viewport.

## Do not

- Don't edit `public/uploads/*` content by hand — it is managed media.
- Don't run `npm run db:seed` on a database with real content (it wipes
  projects/categories/testimonials/messages/content — everything except messages
  draft state).
- Don't commit `.env`, `prisma/dev.db`, `node_modules`, `.next`, or uploads.
- Don't add Prisma provider-specific types (see "Database design rule").
