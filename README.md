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

MemoryOS is a cinematic spatial memory operating system.

It is built to organize memories, projects, screenshots, ideas, relationships, locations, music, dreams, and archived moments as a living interactive graph.

It is not a standard notes app.

It is not a normal task manager.

It is not a simple AI chat shell.

MemoryOS is designed as a futuristic archive environment: a place where personal data becomes spatial, searchable, replayable, and emotionally navigable.

The application combines a premium dark interface, animated graph systems, timeline playback, ambient visual layers, real routes, working settings, developer API tooling, and a modular backend.

The root command starts both sides:

```bash
npm run dev
```

That command runs the frontend and backend together.

---

## Table Of Contents

- [What MemoryOS Is](#what-memoryos-is)
- [Real UI Screenshots](#real-ui-screenshots)
- [Core Features](#core-features)
- [Application Routes](#application-routes)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Frontend Stack](#frontend-stack)
- [Backend Stack](#backend-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running The App](#running-the-app)
- [Available Scripts](#available-scripts)
- [Authentication And Onboarding](#authentication-and-onboarding)
- [Memory Stream](#memory-stream)
- [Node Atlas](#node-atlas)
- [Memory Space](#memory-space)
- [Timeline](#timeline)
- [Archive](#archive)
- [Music System](#music-system)
- [Developer Console](#developer-console)
- [MemoryOS API](#memoryos-api)
- [API Key Usage](#api-key-usage)
- [Release Artifacts](#release-artifacts)
- [Deployment](#deployment)
- [Docker](#docker)
- [Security Model](#security-model)
- [Offline And Sync Behavior](#offline-and-sync-behavior)
- [Performance Notes](#performance-notes)
- [Testing And Verification](#testing-and-verification)
- [Troubleshooting](#troubleshooting)
- [Documentation Map](#documentation-map)
- [Contributing](#contributing)
- [License](#license)

---

## What MemoryOS Is

MemoryOS is a desktop-grade web application for spatial memory management.

The interface treats memories as nodes.

Projects become hubs.

Relationships become connection maps.

Locations become anchors.

Timeline periods become cinematic rails.

Music becomes an emotional layer.

Developer tools expose the archive through a scoped API.

The product goal is simple:

> Make personal history feel explorable.

MemoryOS aims to feel like:

- a digital brain
- a neural archive
- a cinematic operating system
- a tactical investigation board
- a living personal database
- a spatial creative workspace
- a memory replay engine
- a developer-accessible archive platform

The first version is intentionally practical.

It avoids fake impossible AI.

It uses achievable systems:

- metadata analysis
- fuzzy search
- graph relationships
- local persistence
- WebSocket events
- upload handling
- API keys
- route-based UI state
- animated charts
- interactive nodes
- scoped developer endpoints

The uniqueness comes from presentation, interaction, and structure.

---

## Real UI Screenshots

These screenshots are captured from the running MemoryOS application with `agent-browser`.

They are not mockups.

They are not generated illustrations.

They reflect the current local UI.

### Node Atlas

![MemoryOS Node Atlas](assets/screenshots/node-atlas-real.png)

The Node Atlas is the cleaner graph workspace.

It is built for arranging memory nodes without overcrowding the viewport.

It includes:

- React Flow graph rendering
- draggable memory nodes
- connection lines
- compact command controls
- responsive inspector rail
- 3D constellation mode
- clean graph-first layout

### Cinematic Timeline

![MemoryOS Timeline](assets/screenshots/timeline-real.png)

The timeline route turns memory history into a cinematic rail.

It includes:

- period controls
- playback controls
- event clusters
- density visualization
- ECharts analytics
- animated route transitions
- activity heat data

### Developer Console

![MemoryOS Developer Console](assets/screenshots/developer-console-real.png)

The developer console exposes MemoryOS as an integration platform.

It includes:

- API key generation
- scope selection
- webhook settings
- environment helpers
- live API inspector
- integration logs
- release-ready developer workflows

---

## Core Features

MemoryOS includes a full frontend and backend.

The current build contains:

- cinematic dark-only interface
- authenticated entry flow
- first-run onboarding
- configurable notification timer
- real route rendering
- protected application shell
- global search
- quick capture
- memory node graph
- dedicated Node Atlas route
- 3D constellation mode
- timeline replay interface
- archive filtering
- dreamspace panels
- relationship views
- location archive panels
- music linking
- generated Web Audio loops
- Spotify URL parsing
- media upload UI
- settings persistence
- profile modules
- sync diagnostics
- system dashboard
- developer console
- API key generation
- webhook simulation
- public MemoryOS API endpoints
- Fastify backend
- Prisma schema
- PostgreSQL support
- Redis support with graceful local fallback
- JWT authentication backend routes
- WebSocket pulse channel
- Docker setup
- GitHub templates
- CI workflow
- release artifacts

The app is meant to be usable locally immediately.

It also has a clear path to production deployment.

---

## Application Routes

MemoryOS supports auth routes, core routes, and extended workspace routes.

### Auth Routes

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/onboarding`
- `/auth/logout`

### Primary Routes

- `/memory-stream`
- `/archive`
- `/timeline`
- `/nodes`
- `/developer-console`
- `/system`
- `/insights`
- `/sync`
- `/profile`
- `/settings`

### Extended Routes

- `/dashboard`
- `/memory-space`
- `/projects`
- `/dreamspace`
- `/relationships`
- `/locations`
- `/music`
- `/ideas`
- `/media`

The application shell is protected.

Users without a local session are redirected to `/auth/login`.

The demo auth flow persists a local session in browser storage.

---

## Architecture

MemoryOS is split into two primary workspaces.

The frontend is a Vite React application.

The backend is a Fastify TypeScript API.

The project uses npm workspaces.

The root package orchestrates both sides.

```text
memoryos/
├── frontend/
├── backend/
├── docs/
├── assets/
├── scripts/
├── release-artifacts/
├── .github/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── package.json
└── package-lock.json
```

The frontend and backend can be developed independently.

They can also run together through the root command.

The frontend talks to the backend through `/api`.

The backend exposes REST endpoints and a WebSocket channel.

The database layer is Prisma.

The default database target is PostgreSQL.

Redis is supported for caching.

Redis is optional during local development.

If Redis is unavailable, the backend continues without cache.

---

## Repository Structure

### Root

```text
.
├── package.json
├── docker-compose.yml
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── .gitignore
```

The root package contains shared scripts.

The most important root script is:

```bash
npm run dev
```

That starts both the frontend and backend.

### Frontend

```text
frontend/
├── public/
├── src/
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

The frontend source includes:

- `components/`
- `pages/`
- `store/`
- `hooks/`
- `lib/`
- `data/`
- `styles/`

### Backend

```text
backend/
├── prisma/
├── src/
├── uploads/
├── Dockerfile
├── package.json
└── tsconfig.json
```

The backend source includes:

- `modules/`
- `plugins/`
- `utils/`
- `config.ts`
- `server.ts`

### Documentation

```text
docs/
├── API.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── GITHUB.md
└── RELEASE.md
```

### Assets

```text
assets/
└── screenshots/
```

The screenshot directory contains real README screenshots.

### Release Artifacts

```text
release-artifacts/
├── memoryos-site-v0.1.0.zip
├── memoryos-site-v0.1.0.zip.sha256
├── memoryos-api-v0.1.0.zip
└── memoryos-api-v0.1.0.zip.sha256
```

These zip files are downloadable GitHub release assets.

---

## Frontend Stack

The frontend uses:

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- Three.js
- React Three Fiber
- Zustand
- React Router
- Radix UI
- React Flow
- TanStack Query
- Apache ECharts
- Fuse.js
- Lucide React

The frontend is intentionally dark mode only.

The UI language uses:

- matte black backgrounds
- cyan signal accents
- subtle amber highlights
- tactical grid layers
- animated ambient particles
- route-aware lighting
- responsive panels
- soft glow states
- compact operating-system controls

The design avoids:

- white backgrounds
- generic dashboard styling
- bootstrap appearance
- dead controls
- placeholder routes
- static-only data sections

---

## Backend Stack

The backend uses:

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Redis
- JWT
- bcrypt
- Zod
- Fastify rate limiting
- Fastify multipart uploads
- Fastify WebSocket
- Pino structured logging
- Docker

Backend responsibilities include:

- authentication routes
- developer API key routes
- MemoryOS public API routes
- memory record endpoints
- project endpoints
- media upload endpoints
- search endpoints
- smart link endpoints
- health endpoint
- WebSocket pulse channel
- Prisma database access
- Redis plugin

---

## Quick Start

Install dependencies:

```bash
npm install
```

Create environment config:

```bash
cp backend/.env.example backend/.env
```

Start local infrastructure:

```bash
docker compose up -d postgres redis
```

Generate Prisma client:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

Start the app:

```bash
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

If port `5173` is already in use, Vite will choose the next available port.

The backend defaults to:

```text
http://localhost:4400
```

The health endpoint is:

```text
http://localhost:4400/api/health
```

---

## Environment Variables

Backend variables live in:

```text
backend/.env
```

Use:

```text
backend/.env.example
```

as the starting point.

Important variables:

```bash
DATABASE_URL="postgresql://memoryos:memoryos@localhost:5432/memoryos"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="replace-with-a-secure-secret"
COOKIE_SECRET="replace-with-a-secure-cookie-secret"
FRONTEND_ORIGIN="http://localhost:5173"
PORT=4400
```

For production:

- use strong secrets
- use managed PostgreSQL
- use managed Redis
- set `FRONTEND_ORIGIN` to the deployed site domain
- run Prisma migrations during deployment

---

## Running The App

Run both frontend and backend:

```bash
npm run dev
```

Run frontend only:

```bash
npm run dev:frontend
```

Run backend only:

```bash
npm run dev:backend
```

Build everything:

```bash
npm run build
```

Lint everything:

```bash
npm run lint
```

Typecheck everything:

```bash
npm run typecheck
```

---

## Available Scripts

### Root Scripts

```bash
npm run dev
```

Runs frontend and backend together.

```bash
npm run build
```

Builds frontend and backend.

```bash
npm run lint
```

Runs ESLint for both workspaces.

```bash
npm run typecheck
```

Runs TypeScript checks for both workspaces.

```bash
npm run db:generate
```

Generates Prisma client.

```bash
npm run db:migrate
```

Runs local Prisma migrations.

### Frontend Scripts

```bash
npm --workspace frontend run dev
npm --workspace frontend run build
npm --workspace frontend run preview
npm --workspace frontend run lint
npm --workspace frontend run typecheck
```

### Backend Scripts

```bash
npm --workspace backend run dev
npm --workspace backend run build
npm --workspace backend run start
npm --workspace backend run lint
npm --workspace backend run typecheck
npm --workspace backend run db:generate
npm --workspace backend run db:migrate
```

---

## Authentication And Onboarding

MemoryOS includes a working local auth flow.

The auth routes are:

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/onboarding`
- `/auth/logout`

The current frontend auth flow stores a local session object.

That session gates the application shell.

If no session exists, app routes redirect to `/auth/login`.

After the first successful sign-in or registration, the user goes through onboarding.

Onboarding configures:

- operating density
- basic archive orientation
- notification behavior

Onboarding completion is persisted locally.

Logout removes the local session.

Backend JWT auth routes also exist.

Production auth should connect the frontend session to backend JWT cookies.

---

## Memory Stream

Route:

```text
/memory-stream
```

The Memory Stream is the operational landing page.

It gives a live sense of archive activity.

It includes:

- memory filtering
- stream-style records
- active modules
- status cards
- system actions
- local state interactions

This route is intended to feel like the main operating surface.

---

## Node Atlas

Route:

```text
/nodes
```

The Node Atlas is a graph-first workspace.

It is separate from the denser Memory Space route.

It was rebuilt to avoid overcrowding.

It includes:

- React Flow graph canvas
- draggable memory nodes
- animated relationship links
- selected-memory inspector
- compact action bar
- responsive bottom drawer on smaller screens
- desktop right-side inspector rail
- 3D constellation toggle
- orbit depth controls

Primary controls:

- Inspect
- Focus
- Connect
- Add Node
- 3D Map

The graph remains usable across viewport sizes.

The inspector no longer crushes the graph on smaller screens.

---

## Memory Space

Route:

```text
/memory-space
```

Memory Space is the full cinematic spatial archive.

It intentionally has more atmosphere and more interface layers than Node Atlas.

It includes:

- infinite canvas
- memory nodes
- animated links
- temporal scrubber
- smart linking panel
- focus mode
- connect mode
- replay mode
- inspect mode
- group mode
- 3D constellation mode

Memory nodes can represent:

- photos
- screenshots
- notes
- videos
- audio
- links
- location data
- tags
- emotions
- weather
- project references

---

## Timeline

Route:

```text
/timeline
```

The timeline route presents memories as a cinematic rail.

It includes:

- horizontal memory traversal
- period controls
- playback controls
- memory density visuals
- cluster previews
- ECharts analytics
- animated panels
- route transitions

Timeline zoom modes include:

- year
- month
- week
- day

The goal is to make memory review feel closer to editing film than browsing a calendar.

---

## Archive

Route:

```text
/archive
```

The archive route provides searchable memory storage.

It includes:

- text filtering
- record cards
- smart actions
- local persistence
- duplicate-style recovery concepts
- advanced search surfaces

It is designed to feel more like a recovery terminal than a file list.

---

## Music System

Route:

```text
/music
```

The music route contains music-specific linking.

The music linker is intentionally scoped to this route only.

It supports:

- generated Web Audio memory loops
- playable audio textures
- Spotify URL parsing
- Spotify embed URLs
- song-memory linking
- soundtrack-like memory records
- waveform-style visual panels

Supported Spotify URLs include:

- tracks
- albums
- playlists
- artists

The system does not fake music generation through external AI.

Generated loops use practical browser audio APIs.

---

## Developer Console

Route:

```text
/developer-console
```

The Developer Console turns MemoryOS into an integration platform.

It includes:

- API key creation
- API key scopes
- environment profile controls
- webhook endpoint configuration
- webhook event toggles
- webhook secret generation
- `.env` helper output
- API inspector
- endpoint examples
- live response viewer
- local fallback key generation
- backend-registered key support

The top shell also includes a compact Developers control.

That control opens developer tooling from anywhere in the app.

---

## MemoryOS API

Base API URL:

```text
http://localhost:4400/api
```

Health check:

```text
GET /api/health
```

Developer key management:

```text
GET    /api/developer/keys
POST   /api/developer/keys
PATCH  /api/developer/keys/:id
DELETE /api/developer/keys/:id
```

Public integration API:

```text
GET /api/v1/status
GET /api/v1/memories
GET /api/v1/graph
GET /api/v1/search
```

The `/api/v1/*` routes require a MemoryOS API key.

API keys are passed as bearer tokens.

---

## API Key Usage

Generate an API key in:

```text
/developer-console
```

Store it in your environment:

```bash
MEMORYOS_API_KEY=mos_test_or_live_value
```

Call the status endpoint:

```bash
curl http://localhost:4400/api/v1/status \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

Call memories:

```bash
curl "http://localhost:4400/api/v1/memories?take=25" \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

Call graph:

```bash
curl http://localhost:4400/api/v1/graph \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

Call search:

```bash
curl "http://localhost:4400/api/v1/search?q=rain" \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

Scopes include:

- `memories:read`
- `memories:write`
- `search:read`
- `graph:read`
- `webhooks:write`

See [API.md](docs/API.md) for more details.

---

## Release Artifacts

Actual downloadable release artifacts are stored in:

```text
release-artifacts/
```

Current release assets:

```text
release-artifacts/memoryos-site-v0.1.0.zip
release-artifacts/memoryos-site-v0.1.0.zip.sha256
release-artifacts/memoryos-api-v0.1.0.zip
release-artifacts/memoryos-api-v0.1.0.zip.sha256
```

### Site Artifact

The site artifact contains the production build from:

```text
frontend/dist
```

Use it for:

- GitHub Release uploads
- static hosting
- manual deployment
- preview distribution

### API Artifact

The API artifact contains:

- compiled backend `dist`
- Prisma schema and migrations
- backend `package.json`
- backend `Dockerfile`
- backend `.env.example`
- root `package-lock.json`
- docs
- license
- changelog

Use it for:

- GitHub Release uploads
- backend deployment handoff
- API server distribution
- Docker-based deployment preparation

### Rebuilding Release Assets

Run:

```bash
npm run build
```

Then package the site and API from the build output.

The current release assets were generated from the production build.

---

## Deployment

### Frontend Deployment

The frontend is Vercel-ready.

Recommended settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Set API URL variables as needed.

If the backend is deployed separately, configure the frontend to point to it.

### Backend Deployment

The backend is Docker-ready.

Recommended targets:

- Railway
- Render
- Fly.io
- Docker host
- Kubernetes

Required services:

- PostgreSQL
- Redis

Redis may be optional for simple local use.

It is recommended for production cache behavior.

### Migration Command

Run before starting production:

```bash
npx prisma migrate deploy
```

---

## Docker

Start local infrastructure:

```bash
docker compose up -d postgres redis
```

Stop local infrastructure:

```bash
docker compose down
```

Reset volumes:

```bash
docker compose down -v
```

The backend Dockerfile lives at:

```text
backend/Dockerfile
```

---

## Security Model

MemoryOS includes baseline security features.

Implemented backend security includes:

- JWT setup
- cookie support
- CSRF protection plugin
- helmet headers
- CORS configuration
- rate limiting
- input validation with Zod
- bcrypt password hashing support
- Prisma query safety
- sanitized upload filenames
- file size and type constraints
- scoped API keys
- key prefix lookup
- key revocation

Production recommendations:

- rotate secrets
- use HTTPS only
- use secure cookies
- restrict CORS origins
- use managed database credentials
- back up PostgreSQL
- store uploaded media in object storage
- scan uploaded media where appropriate
- avoid committing `.env` files

See [SECURITY.md](SECURITY.md).

---

## Offline And Sync Behavior

MemoryOS includes local-first behavior in the UI.

Features include:

- local record persistence
- offline queue storage
- sync status controls
- local backup snapshots
- exportable archive JSON
- service worker registration in production
- WebSocket status behavior

Offline captures can be queued.

The sync route can flush local queue state.

The settings route exposes storage and backup controls.

---

## Performance Notes

MemoryOS uses several visual systems.

Performance matters.

Current optimization strategies include:

- Vite chunking
- lazy-loaded routes
- React Flow for graph rendering
- ECharts loaded as a chart chunk
- Three.js separated as its own chunk
- GSAP separated as an animation chunk
- local state scoped through Zustand
- responsive panel layouts
- route-level code splitting
- CSS-driven ambient effects
- controlled notification timers

Large chunks are expected for:

- Three.js
- React Flow
- ECharts

These are split from the main app bundle.

---

## Testing And Verification

Run the full local verification set:

```bash
npm run typecheck
npm run lint
npm run build
```

Current verification status:

- TypeScript passes
- ESLint passes
- Production build passes
- Auth routes return 200 locally
- Favicon route returns 200 locally
- API health returns 200 locally

Manual routes to check:

- `/auth/login`
- `/auth/onboarding`
- `/memory-stream`
- `/nodes`
- `/timeline`
- `/developer-console`
- `/settings`
- `/music`

Useful browser smoke checks:

```bash
npm exec agent-browser -- --session memoryos-readme open http://localhost:5173/nodes
npm exec agent-browser -- --session memoryos-readme screenshot assets/screenshots/node-atlas-real.png
```

Use `agent-browser` screenshots to update README UI images.

---

## Troubleshooting

### `npm run dev` starts on a different frontend port

Vite uses the next available port if `5173` is busy.

Look at terminal output for the actual local URL.

### Backend health returns 404

Use:

```text
http://localhost:4400/api/health
```

The health endpoint is under `/api`.

### Redis unavailable warning appears

Redis is optional for local development.

The backend continues without cache.

Start Redis with:

```bash
docker compose up -d redis
```

### Prisma client errors

Run:

```bash
npm run db:generate
```

Then run:

```bash
npm run db:migrate
```

### Protected routes redirect to login

Sign in through:

```text
/auth/login
```

The local demo auth flow creates `memoryos.session`.

### Onboarding repeats

Complete onboarding once.

It stores:

```text
memoryos.onboarding
```

in browser localStorage.

### API key fails

Check that:

- the backend is running
- the key starts with `mos_`
- the key is active
- the key has the needed scopes
- the request includes `Authorization: Bearer`

### Screenshots look logged out

Seed a browser session before screenshot capture.

Example:

```bash
npm exec agent-browser -- --session memoryos-readme eval "localStorage.setItem('memoryos.session', JSON.stringify({email:'demo@memoryos.local', name:'Archive Operator', remember:true, createdAt:new Date().toISOString()})); localStorage.setItem('memoryos.onboarding', JSON.stringify({completedAt:new Date().toISOString()}));"
```

---

## Documentation Map

Primary docs:

- [API](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [GitHub Workflow](docs/GITHUB.md)
- [Release Notes](docs/RELEASE.md)
- [Security](SECURITY.md)

Project process:

- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)

Release downloads:

- [Site ZIP](release-artifacts/memoryos-site-v0.1.0.zip)
- [Site SHA256](release-artifacts/memoryos-site-v0.1.0.zip.sha256)
- [API ZIP](release-artifacts/memoryos-api-v0.1.0.zip)
- [API SHA256](release-artifacts/memoryos-api-v0.1.0.zip.sha256)

Screenshots:

- [Node Atlas](assets/screenshots/node-atlas-real.png)
- [Timeline](assets/screenshots/timeline-real.png)
- [Developer Console](assets/screenshots/developer-console-real.png)

---

## GitHub Release Checklist

Before creating a GitHub Release:

- Run `npm run typecheck`
- Run `npm run lint`
- Run `npm run build`
- Confirm README screenshots are current
- Confirm `release-artifacts` zip files exist
- Confirm `.sha256` files exist
- Confirm `CHANGELOG.md` is updated
- Confirm `docs/RELEASE.md` is updated
- Confirm API migrations are included
- Confirm deployment docs are accurate

Suggested release title:

```text
MemoryOS v0.1.0
```

Suggested release assets:

```text
memoryos-site-v0.1.0.zip
memoryos-site-v0.1.0.zip.sha256
memoryos-api-v0.1.0.zip
memoryos-api-v0.1.0.zip.sha256
```

Suggested release summary:

```text
Initial MemoryOS release with cinematic spatial memory UI, Node Atlas, timeline rail, developer console, API key system, and deployable frontend/backend artifacts.
```

---

## Development Philosophy

MemoryOS should feel premium.

It should feel interactive.

It should feel useful.

Every route should render real content.

Every button should do something.

Every panel should have a purpose.

The system should avoid empty placeholder surfaces.

The product should stay realistic.

It should not rely on impossible AI claims.

It should use practical systems well.

The best version of MemoryOS is:

- spatial
- fast
- cinematic
- personal
- inspectable
- developer-friendly
- emotionally engaging
- operationally credible

---

## Current Limitations

MemoryOS is still an early release.

Known limitations:

- frontend auth uses local demo session behavior
- backend JWT routes exist but are not fully wired to frontend auth state
- uploads are local backend uploads, not object storage
- Redis is optional locally and should be managed in production
- Spotify support parses and embeds links but does not authenticate with Spotify OAuth
- Web Audio generation is browser-based and intentionally lightweight
- release zips do not include production `node_modules`

These are deliberate early-release tradeoffs.

They keep the project runnable and understandable.

---

## Roadmap Ideas

Possible next releases:

- backend-backed frontend auth session
- API documentation site
- database seed command
- object storage adapter
- richer media previews
- real Spotify OAuth integration
- graph virtualization improvements
- advanced timeline playback
- import/export UI
- signed upload URLs
- API usage analytics
- webhook delivery retries
- more release automation
- Playwright regression suite
- production observability

---

## Contributing

Read:

[CONTRIBUTING.md](CONTRIBUTING.md)

Before contributing:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Use small focused changes.

Keep the interface cohesive.

Avoid adding dead buttons.

Avoid adding placeholder routes.

Prefer existing components.

Prefer shared visual language.

Keep the app dark-mode first.

Keep performance in mind.

---

## License

MemoryOS is released under the MIT License.

See:

[LICENSE](LICENSE)

