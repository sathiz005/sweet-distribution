# Venkateswari Sweets Platform

Production-oriented replacement for the browser-only order book.

- `backend`: NestJS + Prisma + PostgreSQL API.
- `frontend`: Next.js dashboard; everyone can read, the configured administrator can change data.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and configure a strong administrator password hash.
2. Start PostgreSQL: `docker compose up -d db`.
3. In `backend`, run `npm install`, then `npm run prisma:generate` and `npm run prisma:migrate`.
4. In `frontend`, run `npm install`.
5. In separate terminals, run `npm run start:dev` from `backend` and `npm run dev` from `frontend`.

The API runs on port 4000 and the dashboard on port 3000.
