# PROGRESS.md: Digital Saheli build tracker (read this first)

Update this file at the end of every phase. Status: ✅ done · 🟡 partial · ⬜ not started.
Spec: `DIGITAL_SAHELI_PROJECT.md`. **Last updated: Phase 2 + Infrastructure overhaul (Oct 2026).**

---

## ⚠ Verification status

Phases 0–2 were written **without running `npm install` / `next build`** (no network in the original sandbox).
The infrastructure overhaul (PostgreSQL, Docker, shadcn dropdown/calendar, navbar fix) was applied and verified with `npx tsc --noEmit` ✅ (zero errors).

---

## Phase table

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold, theme tokens, Phosphor, navbar/footer/logo, language switch | ✅ |
| 1 | Prisma schema, DB setup, seed | ✅ (now PostgreSQL) |
| 2 | Auth: register, login, logout, profile, role guard, `proxy.ts` | ✅ |
| 3 | Home dashboard: alerts, tip of the day, progress | 🟡 skeleton works; missing `/dashboard`, per-course progress cards |
| 4 | Learn modules 3/4/5: lesson view + Mark as Complete | 🟡 `/learn` and `/c/[slug]` work; missing dedicated lesson routes, more lessons per course |
| 5 | Safety modules 6/8/12 | 🟡 `/safety`, `/safety/simulator` (client-only), `/safety/check-message` work; SimulatorAttempt saving missing |
| 6 | Payments (7), Help & Reports (9), Privacy (15), Government (14) | 🟡 `/help` + report form exist; `/payments`, `/privacy`, `/government` pending |
| 7 | SHG (10) + Digital Business (13) | ✅ |
| 8 | Training (11): quiz, certificate (printable, labelled demo) | ✅ |
| 9 | Admin panel (16): CRUD + analytics charts | 🟡 `/admin` has 5 count cards + alerts CRUD; missing sub-pages, full CRUD, charts |
| 10 | Hindi translations, responsive + a11y pass, demo script | ⬜ |
| **Infra** | PostgreSQL, Docker, shadcn DropdownMenu/Calendar, navbar overflow fix | ✅ |

**Next phase to work on:** Phase 3, then finish 🟡 items in order 4 → 5 → 6 → 10.

---

## Infrastructure overhaul (applied after Phase 2)

### Database: SQLite → PostgreSQL

- `prisma/schema.prisma` updated: `provider = "postgresql"`, `directUrl = env("DIRECT_URL")`.
- **Local dev**: Docker Compose (`docker-compose.yml`) spins up `postgres:16-alpine`.
- **Production**: [Neon](https://neon.tech) serverless PostgreSQL.
  - `DATABASE_URL` = pooled endpoint · `DIRECT_URL` = direct endpoint.
- `.env` and `.env.example` updated with both URL variables.
- Packages added: `@neondatabase/serverless`, `@prisma/adapter-neon`.

### Docker

- `Dockerfile`: multi-stage build (deps → builder → runner), non-root user, `output: "standalone"` in `next.config.ts`.
- `docker-compose.yml`: `db` (PostgreSQL + healthcheck) + `app` services.
- Usage: `docker compose up --build` → `http://localhost:3000`.

### Navbar overflow & dropdown bugs fixed

- **Root cause**: `<details>/<summary>` HTML elements don't auto-close when a sibling opens, and the wide nav overflowed on mid-sized screens.
- **Fix**: Replaced `<details>` with shadcn `<DropdownMenu>` (Radix UI), which:
  - Closes automatically when another dropdown opens (single `openKey` state).
  - Closes on route change (`usePathname` effect).
  - Closes on outside click.
- Navbar is now a client component (`"use client"`) with `usePathname` + `useRef` for outside-click detection.
- Nav container updated to `max-w-7xl` and compact `size="sm"` buttons to prevent overflow.

### shadcn component upgrades

| Component | Change |
|---|---|
| `dropdown-menu.tsx` | ✅ New – Radix DropdownMenu, fixed `cn` import path |
| `popover.tsx` | ✅ New – Radix Popover, fixed `cn` import path |
| `calendar.tsx` | ✅ New – react-day-picker v10 + DayPicker, fixed `cn` import |
| `date-picker.tsx` | ✅ New – Calendar + Popover date picker with hidden form input |
| `select.tsx` | ✅ Replaced native `<select>` wrapper with Radix Select (shadcn) |
| `native-select.tsx` | ✅ New – original native `<select>` wrapper, used where form `name` is needed |
| `lang-switch.tsx` | ✅ Updated to use shadcn Radix Select |
| `auth-form.tsx` | ✅ Updated to use NativeSelect |
| `profile/page.tsx` | ✅ Updated to use NativeSelect |
| `help/report/report-form.tsx` | ✅ Updated to use NativeSelect + DatePicker |
| `admin/alerts/page.tsx` | ✅ Updated to use NativeSelect |

---

## What exists now (file map)

- `package.json`, `tsconfig.json`, `next.config.ts` (`output: "standalone"`), `postcss.config.mjs`, `components.json`
- `Dockerfile`, `docker-compose.yml`, `.env`, `.env.example`
- `prisma/schema.prisma`: PostgreSQL, 20+ models, `directUrl`
- `src/app/globals.css`: shadcn tokens (light + `.dark`), brand purple `#5b2a86`, teal `#0f8a7e`
- `src/components/ui/*`: button, card, input, textarea, label, badge, progress, sheet, alert, avatar, separator, tabs, table, select (Radix), native-select, dropdown-menu, popover, calendar, date-picker
- `src/components/navbar.tsx`: client component, shadcn DropdownMenu per section, auto-close
- `src/components/layout/`: logo, footer, lang-switch (Radix Select), mobile-menu
- `src/lib/auth.ts`: JWT cookie session, `requireUser()`, `requireAdmin()`
- `src/app/actions.ts`: server actions (register, login, logout, updateProfile, setLanguage, completeLesson, checkMessage, submitReport, joinShg, addProduct, createAlert, toggleAlert, …)
- **Pages**: `/`, `/learn`, `/c/[slug]`, `/learn/[slug]/[lessonSlug]`, `/safety`, `/safety/simulator`, `/safety/check-message`, `/safety/academy`, `/help`, `/help/report`, `/payments`, `/privacy`, `/government`, `/shg`, `/shg/[id]`, `/shg/business`, `/training`, `/training/[slug]/quiz`, `/training/certificates`, `/training/certificate/[id]`, `/profile`, `/login`, `/register`, `/admin`, `/admin/alerts`, and more

---

## Conventions for the next LLM

- Next 16: `params`/`searchParams` are Promises — always `await`.
- Never trust the client: compute quiz scores and permissions on the server. Use `requireUser()` / `requireAdmin()`.
- Database: PostgreSQL via Prisma. Local = Docker. Prod = Neon. Both `DATABASE_URL` + `DIRECT_URL` required.
- UI: use shadcn Radix components from `@/components/ui/*`. For form `<select>` needing `name=` (FormData), use `NativeSelect`. For the Radix controlled Select, use `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`.
- Content rules: only numbers 112, 1930, 181; only official `.gov.in` links; label Report form and certificates as **demo**; message checker must show disclaimer and store only a hash.
- Seed is idempotent for users/courses. After schema changes, run `npx prisma db push` (local) or `npx prisma migrate deploy` (Neon).
- After each phase: run `npx tsc --noEmit && npm run build`, update the table above, and list new files.
