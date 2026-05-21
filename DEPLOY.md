# Docker deployment (main branch)

Production stack: **PostgreSQL** + **Express API** + **Nginx** (React SPA built at image build time).

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- Ports **80** (app), **3060** (API, optional direct access), **5432** (DB, optional) available

## Quick start

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD (and ports if needed)

docker compose up -d --build
```

Open **http://localhost** (or your host on `HTTP_PUBLISH_PORT`).

- UI → Nginx on port 80  
- API → proxied at `/api/*` → `backend:3060`  
- Health → `http://localhost:3060/health` (backend), DB via compose healthcheck  

## Services

| Service   | Container      | Role                                      |
|-----------|----------------|-------------------------------------------|
| `db`      | `reli-db`      | PostgreSQL 16, schema from `server/init.sql` |
| `backend` | `reli-backend` | Node/Express API on 3060                  |
| `frontend`| `reli-frontend`| Nginx serves Vite build, proxies `/api`   |

## Main-branch production scope

The frontend image is built from **main** routes only (Operations Hub, Tanks, Flow Meters, Fueling Sessions, Incidents, User Access Control, Settings). Dev-only modules are not routed in production.

Build-time env (set in `docker-compose.yml`):

- `VITE_API_BASE_URL=/api` — browser calls same-origin API  
- `VITE_USE_MOCK=false` — live backend only  

## Operations

```bash
# Logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build

# Stop and remove containers (keeps DB volume)
docker compose down

# Stop and wipe database volume
docker compose down -v
```

## Server deployment notes

1. Set strong `POSTGRES_PASSWORD` in `.env`; do not commit `.env`.
2. Consider not publishing `DB_PUBLISH_PORT` on public hosts (remove or bind to `127.0.0.1` in compose overrides).
3. Put TLS in front of Nginx (reverse proxy or load balancer terminating HTTPS).
4. First boot runs `server/init.sql` once when the `pgdata` volume is empty.

## Troubleshooting

| Issue | Check |
|-------|--------|
| 502 on `/api` | `docker compose ps` — backend must be healthy |
| Blank UI | `docker compose logs frontend` — build errors |
| DB connection errors | `docker compose logs db backend` — wait for db healthy |
| Port in use | Change `HTTP_PUBLISH_PORT` / `API_PUBLISH_PORT` in `.env` |
