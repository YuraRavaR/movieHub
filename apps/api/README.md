# MovieHub API

Backend app for MovieHub, built with NestJS + Prisma.

## Run (from repo root)

```bash
npm run dev
```

API is available at `http://localhost:3000`.
Swagger is available at `http://localhost:3000/api/docs`.

## Key endpoints

- `GET /health`
- `GET /movies/search?query=...`
- `POST /movies/status`
- `GET /movies/status/:userEmail`
- `PATCH /movies/status/:userEmail/:tmdbId`
- `DELETE /movies/status/:userEmail/:tmdbId`

## Database

Run migration from repo root:

```bash
npm run prisma:migrate:dev --workspace api
```

For full project setup, see root `README.md`.
