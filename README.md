# Lucky Six — Server (Express + TypeScript + Prisma + Socket.IO)

## Quick start (dev)

```bash
cp .env.example .env
npm i
npm run prisma:migrate
npm run dev
```

- API: `http://localhost:8080/api`
- Socket.IO namespace: `ws://localhost:8080/tv`

## Key endpoints

- `GET /api/health` — status
- `GET /api/settings` — read settings
- `PATCH /api/settings` — update
- `GET /api/rounds/latest` — latest round DTO
- `GET /api/rounds?take=20&cursor=...` — list
- `POST /api/rounds/start` — start round now (body `{ drawNumbers?: number[] }`)
- `POST /api/tickets` — save printed ticket

## Frontend integration hints

- Replace localStorage store with server fetches:
  - `GET /api/rounds/latest` to hydrate TVScreen.
  - Use Socket.IO `/tv` channel for live events (`draw:emerge`, `draw:landed`, `round:start`, `summary:start`, `countdown:start`).
- Admin can call `POST /api/rounds/start` — server returns RoundDTO.

## Migrations

- Adjust `prisma/schema.prisma` as needed, run `npm run prisma:migrate`.

## Docker

```bash
docker compose up -d --build
```
