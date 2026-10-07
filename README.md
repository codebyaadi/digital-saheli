# Digital Saheli

**Next.js 16 · Tailwind 4 · shadcn/ui · Phosphor Icons · Prisma 6 · PostgreSQL**

A digital literacy and safety platform for rural women self-help groups (SHGs) in India.

---

## Quick start (local dev with Docker)

```bash
# 1. Clone & install
npm install

# 2. Start local PostgreSQL
docker compose up db -d

# 3. Apply schema & seed demo data
npm run setup     # prisma db push + seed

# 4. Run the dev server
npm run dev       # http://localhost:3000
```

**Demo logins** (password `Demo@123`):

| Email | Role |
|---|---|
| `demo@saheli.demo` | Learner |
| `admin@saheli.demo` | Admin (see `/admin`) |

---

## Running the full stack with Docker

```bash
# Builds the app image and starts both DB + app
docker compose up --build
```

The app will be at `http://localhost:3000`.  
Run migrations inside the container:

```bash
docker compose exec app npx prisma db push
docker compose exec app npm run setup
```

---

## Production deployment (Neon + Vercel / any Node host)

1. Create a [Neon](https://neon.tech) project (free tier is fine).
2. Copy **pooled** connection string → `DATABASE_URL`.
3. Copy **direct** connection string → `DIRECT_URL`.
4. Set `AUTH_SECRET` to a long random string (`openssl rand -base64 32`).
5. Deploy. On first deploy, run `npx prisma db push && npm run setup`.

> Neon's pooler URL goes in `DATABASE_URL`; the direct (non-pooled) URL goes in `DIRECT_URL` so Prisma migrations can bypass the pooler.

---

## Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled for Neon) |
| `DIRECT_URL` | PostgreSQL direct connection string (for migrations) |
| `AUTH_SECRET` | JWT signing secret (required in production) |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (New York style, Radix primitives) |
| Icons | Phosphor Icons |
| ORM | Prisma 6 |
| Database (local) | PostgreSQL 16 via Docker |
| Database (prod) | Neon (serverless PostgreSQL) |
| Auth | JWT in HTTP-only cookie (`jose`) |

**Build status and next steps → read `PROGRESS.md` first.**  
Full 16-module plan and spec → `DIGITAL_SAHELI_PROJECT.md`.
