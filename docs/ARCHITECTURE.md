# Architecture

```text
Browser
  |
  | Vite React UI: graph, timeline, route modules
  |
Fastify API
  |-- Auth: JWT, bcrypt, secure cookie
  |-- Memories: graph nodes and links
  |-- Search: text, tags, emotion, location
  |-- Media: sanitized uploads and thumbnails
  |-- WebSocket: realtime archive pulses
  |
PostgreSQL via Prisma
Redis cache
Upload storage
```

The frontend keeps high-frequency interaction state in Zustand and server state in TanStack Query. React Flow handles scalable graph panning, zooming, node dragging, and edge animation. Three.js renders the ambient particle field independently from the main DOM.

The backend is split into modules under `src/modules`, with shared plugins for Prisma and Redis. Validation happens at the route boundary through Zod.
