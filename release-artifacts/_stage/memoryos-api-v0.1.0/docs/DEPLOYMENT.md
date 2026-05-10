# Deployment

## Frontend on Vercel

Set the project root to `frontend`, build command to `npm run build`, and output directory to `dist`. Configure `VITE_API_URL` if you deploy the API separately.

## Backend on Railway, Render, or Fly.io

Use `backend/Dockerfile`. Provide:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `FRONTEND_ORIGIN`

Run `npx prisma migrate deploy` before starting the service.

## Docker Local

```bash
docker compose up -d postgres redis
npm run db:migrate
npm run dev
```
