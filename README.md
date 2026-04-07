# MovieHub

MovieHub is a full-stack movie database app with TMDB search and personal movie statuses (`WATCHLIST` / `WATCHED`).

## What it does

- Search movies from TMDB
- Sign up / login with cookie-based auth
- Add movies to personal list
- Mark movies as watched
- Remove movies from list
- Manage everything from a single web UI

## Tech stack

- Monorepo: Turborepo + npm workspaces
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: NestJS (TypeScript)
- Database: PostgreSQL + Prisma
- External API: TMDB
- Tests: Jest, Playwright

## Repository structure

- `apps/web` - frontend
- `apps/api` - backend
- `packages/shared-types` - shared API contracts/types

## Quick start

### 1) Prerequisites

- Node.js 22+
- npm 11+
- Docker

### 2) Install dependencies

```bash
npm install
```

### 3) Start PostgreSQL

```bash
docker compose up -d
```

### 4) Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Set real TMDB key in `apps/api/.env`:

```env
TMDB_API_KEY=your_real_tmdb_api_key
JWT_SECRET=replace_with_long_random_string
```

### 5) Run database migration

```bash
npm run prisma:migrate:dev --workspace api
```

### 6) Run the app

```bash
npm run dev
```

## Local URLs

- Web: `http://localhost:3001`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Useful commands

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e:api`
- `npm run test:e2e:web`
