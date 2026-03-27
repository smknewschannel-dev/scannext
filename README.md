# scannext

OT Security Suite starter project (React + Node API Gateway + Go services + Postgres + Redis) with device discovery demo data and searchable OT asset finder UI.

## Project structure

- `apps/web` — React + Vite professional dashboard UI with filters, KPIs, and devices table
- `apps/api-gateway` — Node/Express API gateway with seeded OT devices + alerts data
- `services/asset-scanner` — Go health service
- `services/rule-engine` — Go health service
- `docs/schema.sql` — MVP database schema
- `docker-compose.yml` — Local full-stack environment

## Prerequisites

- Docker Desktop (4.66.1 works)
- Node.js 22+
- Go 1.23+

## Quick start

```bash
cp .env.example .env
docker compose up -d
```

## Demo endpoints

- Web UI: http://localhost:5173
- API health: http://localhost:8080/health
- Dashboard summary: http://localhost:8080/dashboard
- Device finder API: http://localhost:8080/devices
- Alerts API: http://localhost:8080/alerts

### Device finder query params

`/devices?q=plc&status=online&site=Pune%20Plant%20A&protocol=S7&sort=risk-desc`

- `q`: name/IP/vendor/model/zone search
- `status`: `all | online | degraded | offline`
- `site`: `all` or a known site
- `protocol`: `all | Modbus | DNP3 | OPC-UA | BACnet | S7`
- `sort`: `risk-desc | risk-asc | name-asc | recent-desc`

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
