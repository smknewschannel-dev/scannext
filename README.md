# scannext

OT Security Suite starter project (React + Node API Gateway + Go services + Postgres + Redis) with device discovery, professional UI, and optional nearby network scan support.

## Project structure

- `apps/web` — React + Vite dashboard UI with filters, KPIs, device finder, and nearby scan table
- `apps/api-gateway` — Node/Express API gateway with OT demo inventory + live network scan endpoint
- `services/asset-scanner` — Go health service
- `services/rule-engine` — Go health service
- `docs/schema.sql` — MVP database schema
- `docker-compose.yml` — Local full-stack environment

## Prerequisites

- Docker Desktop (4.66.1 works)
- Node.js 22+
- Go 1.23+
- Optional for live scan quality: `nmap` installed in API runtime

## Quick start

```bash
cp .env.example .env
docker compose up -d
```


## If GitHub shows merge conflicts

If PR page shows conflicts in `Makefile`, `README.md`, `apps/api-gateway/src/index.ts`, `apps/web/src/App.tsx`, `apps/web/src/styles.css`, `docker-compose.yml`, run locally:

```bash
git checkout <your-branch>
make merge-main
make resolve-pr-conflicts
make check-conflicts
git commit -m "Resolve merge conflicts with current branch versions"
git push
```

Then refresh PR page and click **Mark as resolved** if using web editor.

## Endpoints

- Web UI: http://localhost:5173
- API health: http://localhost:8080/health
- Dashboard summary: http://localhost:8080/dashboard
- Device finder API: http://localhost:8080/devices
- Alerts API: http://localhost:8080/alerts
- Nearby scan API: http://localhost:8080/network/scan
- Asset scanner health: http://localhost:8090/health
- Rule engine health: http://localhost:8091/health

### Device finder query params

`/devices?q=plc&status=online&site=Pune%20Plant%20A&protocol=S7&sort=risk-desc`

- `q`: name/IP/vendor/model/zone search
- `status`: `all | online | degraded | offline`
- `site`: `all` or a known site
- `protocol`: `all | Modbus | DNP3 | OPC-UA | BACnet | S7`
- `sort`: `risk-desc | risk-asc | name-asc | recent-desc`

## Nearby scan notes

- `GET /network/scan` attempts `nmap -sn <subnet> -oG -` first.
- If `nmap` is unavailable, it falls back to `arp -an`.
- Subnet autodetects from host interfaces; override using `SCAN_SUBNET` env var.
- Device typing is heuristic-based (`router`, `phone`, `laptop`, `iot`, `server`, `unknown`).

## Run without Docker (optional)

### API Gateway

```bash
cd apps/api-gateway
npm install
npm run dev
```

### Web

```bash
cd apps/web
npm install
npm run dev
```

### Go services

```bash
cd services/asset-scanner && go run ./cmd/server
cd services/rule-engine && go run ./cmd/server
```

## Apply schema

```bash
psql "postgres://scannext:scannext@localhost:5432/scannext?sslmode=disable" -f docs/schema.sql
```
