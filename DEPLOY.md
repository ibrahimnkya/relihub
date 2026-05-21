# Docker deployment (main branch — frontend only)

Production on **main** ships only the **React SPA** behind Nginx. The API runs elsewhere (default: `https://mafuta.mysafari.co.tz/api`).

No PostgreSQL or Express containers are started from this compose file.

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- Port **80** (or `HTTP_PUBLISH_PORT`) available
- A reachable backend API at `VITE_API_BASE_URL`

## Quick start

```bash
cp .env.example .env
# Optional: set VITE_API_BASE_URL and HTTP_PUBLISH_PORT

docker compose up -d --build
```

Open **http://localhost** (or your configured port).

## Build-time configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `https://mafuta.mysafari.co.tz/api` | Axios base URL baked into the build |
| `VITE_USE_MOCK` | `false` | Always live API in production images |

Change `VITE_API_BASE_URL` in `.env` **before** `docker compose build` — Vite inlines env vars at build time.

## Main-branch UI scope

Routes on **main**: Operations Hub, Tanks, Flow Meters, Fueling Sessions, Incidents, User Access Control, Settings. Dev-only modules redirect to the dashboard.

## Operations

```bash
docker compose logs -f
docker compose up -d --build   # after code or .env API URL changes
docker compose down
```

## Server notes

1. Put TLS in front of Nginx (reverse proxy or load balancer).
2. Ensure the API allows CORS from your frontend origin if the API is on another host.
3. Local backend development remains available via `pnpm dev` (not part of this Docker stack).

## Troubleshooting

| Issue | Check |
|-------|--------|
| Blank UI | `docker compose logs frontend` |
| API / auth errors | `VITE_API_BASE_URL`, CORS, network from container host |
| Port in use | Change `HTTP_PUBLISH_PORT` in `.env` |
