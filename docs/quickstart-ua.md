# MovieHub: що вже готово і як запустити

Ця інструкція допоможе швидко підняти поточний стан проєкту локально та перевірити взаємодію між `web` і `api`.

## Що вже готово

- Монорепо на `npm workspaces` + `turbo`.
- `apps/api` (NestJS):
  - `GET /health`
  - CRUD для статусів фільмів:
    - `POST /movies/status`
    - `GET /movies/status/:userEmail`
    - `PATCH /movies/status/:userEmail/:tmdbId`
    - `DELETE /movies/status/:userEmail/:tmdbId`
  - Swagger: `GET /api/docs`
  - Prisma schema + перша міграція
- `apps/web` (Next.js):
  - базова сторінка `MovieHub`
  - перший клієнт до API (`apps/web/lib/movies-api.ts`)
  - демо-читання статусів для `demo@moviehub.local`
- Тести:
  - unit/smoke
  - API e2e
  - web Playwright smoke

## Передумови

- Node.js (LTS)
- npm
- Docker Desktop (для PostgreSQL)

Перевірка:

```bash
node -v
npm -v
docker -v
```

## 1) Встановити залежності

```bash
npm install
```

## 2) Запустити базу даних

```bash
docker compose up -d
```

Перевірити статус:

```bash
docker compose ps
```

## 3) Підготувати env

Створи локальні env-файли з прикладів:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Далі обов'язково встав свій ключ TMDB у `apps/api/.env`:

```env
TMDB_API_KEY=your_real_tmdb_api_key
```

## 4) Застосувати Prisma-міграцію

```bash
npm run prisma:migrate:dev --workspace api
npm run prisma:generate --workspace api
```

## 5) Запустити проєкт

У корені:

```bash
npm run dev
```

Після старту:

- API: [http://localhost:3000](http://localhost:3000)
- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Web: [http://localhost:3001](http://localhost:3001) (у тестах) або стандартний порт Next у dev

## 6) Як спробувати взаємодію (рекомендований порядок)

### Варіант A: через Swagger

1. Відкрий [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
2. Виконай `POST /movies/status` з тілом:

```json
{
  "userEmail": "demo@moviehub.local",
  "tmdbId": 550,
  "title": "Fight Club",
  "status": "WATCHLIST"
}
```

3. Виконай `GET /movies/status/demo@moviehub.local` і переконайся, що запис з'явився.
4. Онови статус через `PATCH /movies/status/demo@moviehub.local/550`:

```json
{
  "status": "WATCHED"
}
```

5. За потреби видали через `DELETE /movies/status/demo@moviehub.local/550`.

6. Перевір TMDB пошук через `GET /movies/search?query=fight%20club`.

### Варіант B: через curl

Створення/оновлення:

```bash
curl -X POST http://localhost:3000/movies/status \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail":"demo@moviehub.local",
    "tmdbId":550,
    "title":"Fight Club",
    "status":"WATCHLIST"
  }'
```

Отримання списку:

```bash
curl http://localhost:3000/movies/status/demo@moviehub.local
```

Оновлення:

```bash
curl -X PATCH http://localhost:3000/movies/status/demo@moviehub.local/550 \
  -H "Content-Type: application/json" \
  -d '{"status":"WATCHED"}'
```

Видалення:

```bash
curl -X DELETE http://localhost:3000/movies/status/demo@moviehub.local/550
```

### Варіант C: через web

1. Додай/онови дані через Swagger або curl.
2. Відкрий `http://localhost:3001`.
3. Перейди на `Search` або `Watchlist` у верхній навігації.
4. Перевір:
   - пошук по TMDB і додавання у список;
   - керування статусами у `Watchlist`.

## 7) Швидка перевірка якості

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e:api
npm run test:e2e:web
```

## Типові проблеми

- **API не піднімається**: перевір `.env` в `apps/api` і чи зайнятий порт `3000`.
- **Помилки БД**: переконайся, що `docker compose up -d` успішний і міграція застосована.
- **Web не бачить API**: перевір `apps/web/.env.local` (`NEXT_PUBLIC_API_URL`).
- **Безпека git**: не коміть локальні `.env`/`.env.local` файли, коміть лише `.env.example`.
