# scannext

OT Security Suite starter project (React + Node API Gateway + Go services + Postgres + Redis).

## Project structure

- `apps/web` — React + Vite dashboard (Assets, Alerts, Risk Score)
- `apps/api-gateway` — Node/Express API gateway
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

## Endpoints

- Web: http://localhost:5173
- API Gateway health: http://localhost:8080/health
- API Gateway dashboard payload: http://localhost:8080/dashboard
- Asset scanner health: http://localhost:8090/health
- Rule engine health: http://localhost:8091/health

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
