# MemoryOS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=0b1020)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-111827?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MemoryOS API](https://img.shields.io/badge/MemoryOS%20API-v0.1.0-62f0ff)](docs/API.md)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)](docker-compose.yml)
[![Vercel](https://img.shields.io/badge/Vercel-ready-000000?logo=vercel&logoColor=white)](docs/DEPLOYMENT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-facc15.svg)](LICENSE)

MemoryOS is a cinematic, spatial memory operating system for organizing memories, projects, dreams, relationships, locations, music, ideas, and media as an interactive living graph.

`npm run dev` starts the frontend and backend together from the repo root.

## UI Screenshots

| Node Atlas | Cinematic Timeline | Developer API |
| --- | --- | --- |
| ![Node Atlas](assets/screenshots/node-atlas.svg) | ![Timeline Rail](assets/screenshots/timeline-rail.svg) | ![Developer API](assets/screenshots/developer-api.svg) |

## Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, Framer Motion, Three.js, Zustand, React Router, Radix UI, React Flow, TanStack Query.
- Backend: Fastify, TypeScript, Prisma, PostgreSQL, Redis, WebSockets, JWT auth, bcrypt, validation, rate limiting, structured logging.

## Quick Start

```bash
npm install
cp backend/.env.example backend/.env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run dev
```

The root `npm run dev` command runs both workspaces in parallel:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4400`
- Health check: `http://localhost:4400/api/health`

If you only need one side:

```bash
npm run dev:frontend
npm run dev:backend
```

## Available Scripts

```bash
npm run dev          # frontend + backend together
npm run build        # production builds for both workspaces
npm run lint         # ESLint for frontend and backend
npm run typecheck    # TypeScript checks for frontend and backend
npm run db:generate  # generate Prisma client
npm run db:migrate   # run local Prisma migration
```

## Routes

Auth routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/logout`.

Primary application routes: `/`, `/memory-stream`, `/archive`, `/timeline`, `/nodes`, `/developer-console`, `/system`, `/insights`, `/sync`, `/profile`, `/settings`.

Extended workspace routes: `/dashboard`, `/memory-space`, `/projects`, `/dreamspace`, `/relationships`, `/locations`, `/music`, `/ideas`, `/media`.

## MemoryOS API

Generate developer keys from the top-header Developers control or `/developer-console`. Backend-registered keys can call the public integration API with a bearer token:

```bash
curl http://localhost:4400/api/v1/status \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

See [API](docs/API.md) for key generation, scopes, and `/api/v1/*` endpoints.

## GitHub

This repo includes GitHub issue templates, a pull request template, and a CI workflow under `.github/`.

See [GitHub Workflow](docs/GITHUB.md) for branch, PR, issue, and CI guidance.

## Documentation

- [API](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [GitHub Workflow](docs/GITHUB.md)
- [Release Notes](docs/RELEASE.md)
- [Security](SECURITY.md)

## Production Notes

- Set strong `JWT_SECRET` and `COOKIE_SECRET` values.
- Run PostgreSQL and Redis as managed services in production.
- Configure `FRONTEND_ORIGIN` to the deployed Vercel domain.
- Keep uploads behind private object storage for real deployments.
- Run Prisma migrations during release.
