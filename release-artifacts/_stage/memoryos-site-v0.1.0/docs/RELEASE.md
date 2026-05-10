# Release Notes

## MemoryOS Site v0.1.0

Release type: cinematic interface hardening and functional UI release.

### Highlights

- Unified the MemoryOS shell around a darker cinematic operating-system aesthetic.
- Added route-level motion with GSAP and animated data surfaces with Apache ECharts.
- Rebuilt the ambient field with route-aware particles, nebula layers, grid overlays, and mouse-reactive lighting.
- Split the Nodes route into a dedicated Node Atlas workspace with a cleaner graph viewport, compact command strip, responsive inspector drawer, and 3D constellation mode.
- Added protected sign-in routing and a first-run onboarding sequence for density, archive orientation, and notification timing.
- Added a configurable notification timer that defaults to three seconds.
- Added MemoryOS favicon and replaced bright white section sheen with softer cyan-only panel lighting.
- Hardened navigation across `/memory-stream`, `/archive`, `/timeline`, `/nodes`, `/developer-console`, `/system`, `/insights`, `/sync`, `/profile`, and `/settings`.
- Expanded settings, profile, developer, sync, and system panels with functional controls and persistent local state.

### Site Verification

Before publishing:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Manual smoke checks:

- Visit `/memory-stream` and confirm the shell, search, quick capture, and status controls render.
- Visit `/nodes` at desktop and mobile widths and confirm the graph, inspector, and command strip do not overlap.
- Visit `/timeline` and confirm playback controls, timeline zoom tabs, and ECharts density panel render.
- Visit `/settings` and confirm compact, balanced, and cinematic density controls change the shell width.
- Visit `/developer-console` and confirm API key, webhook, environment, logs, and API inspector controls work.

### Known Local-Only Notes

- Redis is optional in local development. If Redis is unavailable, the backend logs a warning and continues without cache.
- Frontend dev port may move from `5173` to the next open Vite port when another dev server is already running.

## MemoryOS API v0.1.0

Release type: developer API foundation.

### Highlights

- Added backend-registered MemoryOS API keys with scoped access.
- Added Developer Console flows for API key creation, environment export, webhook configuration, and API inspection.
- Added bearer-token protected `/api/v1/*` routes for external integrations.
- Added Prisma-backed `ApiKey` storage and key-prefix lookup.

### Public Integration Endpoints

Base URL:

```text
http://localhost:4400/api
```

Authenticated API:

```bash
curl http://localhost:4400/api/v1/status \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

Endpoints:

- `GET /api/v1/status`
- `GET /api/v1/memories?take=25`
- `GET /api/v1/graph`
- `GET /api/v1/search?q=`

### API Release Checklist

- Run Prisma migration deploy in production.
- Confirm `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, and `FRONTEND_ORIGIN`.
- Generate a fresh API key in `/developer-console`.
- Store the raw key in `.env.local` as `MEMORYOS_API_KEY`.
- Verify `/api/v1/status` returns active scopes.
- Rotate or revoke test keys before production launch.
