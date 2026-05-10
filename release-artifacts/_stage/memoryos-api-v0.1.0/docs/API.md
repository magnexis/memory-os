# API

Base URL: `/api`

## Auth

- `POST /auth/register` with `email`, `password`, optional `name`, `remember`.
- `POST /auth/login` with `email`, `password`, `remember`.
- `POST /auth/forgot-password` with `email`.
- `POST /auth/reset-password` with `token`, `password`.
- `POST /auth/logout`.

## Memories

- `GET /memories?kind=&take=`
- `POST /memories`
- `PATCH /memories/:id`
- `DELETE /memories/:id`
- `POST /memories/:id/links`

## Search

- `GET /search?q=&tags=&emotion=`
- `GET /smart-links` returns metadata-based link suggestions from shared tags, nearby dates, locations, and emotions.

## Developer Keys

- `GET /developer/keys` lists registered MemoryOS API keys without exposing raw secrets.
- `POST /developer/keys` creates a backend-registered API key. Body: `label`, `scopes`, `environment`.
- `PATCH /developer/keys/:id` updates `status` to `active`, `restricted`, or `revoked`.
- `DELETE /developer/keys/:id` removes a key.

The raw key is returned only once from `POST /developer/keys`. Store it in `.env.local`:

```bash
MEMORYOS_API_KEY=mos_test_or_live_value
```

## MemoryOS API

Use generated keys with `Authorization: Bearer`.

```bash
curl http://localhost:4400/api/v1/status \
  -H "Authorization: Bearer $MEMORYOS_API_KEY"
```

- `GET /v1/status` validates the key and returns active scopes.
- `GET /v1/memories?take=25` requires `memories:read`.
- `GET /v1/graph` requires `memories:read`.
- `GET /v1/search?q=` requires `search:read`.

## Media

- `POST /media/upload` multipart upload for PNG, JPEG, WEBP, MP4, MP3, WAV, and PDF.
- `GET /media`

## Realtime

Connect to `/realtime` by WebSocket. Events use JSON messages with `type` and `message`.
