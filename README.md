# scannext

## OT Security Suite (Go + Node + Postgres + React + Redis)

Ye project guide un founders ke liye hai jinko tech stack nahi aata, lekin Operations Technology (OT) security suite build karna hai.

---

## 1) Deployment model choose karo

Aapke 3 options:

1. **On-prem only**
   - Best for: power plants, factories, oil & gas, strict compliance clients.
   - Pros: data site ke andar rehta hai.
   - Cons: installation/updates hard.

2. **Cloud SaaS**
   - Best for: fast growth, SMB customers, investor demo speed.
   - Pros: fastest launch, recurring revenue model, easy upgrades.
   - Cons: OT customers security concerns raise karte hain.

3. **Hybrid (recommended for OT security startup)**
   - Edge collector on-prem + cloud control plane.
   - Pros: OT-friendly + SaaS scalability + investor friendly.

**Recommendation**: Hybrid se start karo.

---

## 2) High-level architecture (simple)

- **React**: web dashboard (alerts, assets, risk score)
- **Node.js API Gateway**: auth, multi-tenant APIs, UI-facing BFF
- **Go services**: high-performance scanning, protocol parsers, rule engine
- **Postgres**: source-of-truth relational data (tenants, assets, incidents)
- **Redis**: caching + queues + rate limiting + temporary state
- **Message bus (later phase)**: NATS/Kafka for scale

### OT specific split
- **On-prem Edge Agent (Go)**
  - ICS/OT network discovery
  - passive protocol parsing
  - secure outbound sync to cloud
- **Cloud Control Plane**
  - policy management
  - reporting
  - alert workflow
  - tenant isolation

---

## 3) 90-day execution roadmap

### Phase 1 (Week 1-2): Foundation
- Repo setup
- Local docker infra
- Auth + tenant model
- Basic dashboard skeleton

### Phase 2 (Week 3-6): Core product
- Asset inventory ingestion
- Alert pipeline
- Rules engine (MVP)
- RBAC + audit logs

### Phase 3 (Week 7-10): OT hardening
- Edge-to-cloud secure channel
- Certificate-based agent auth
- Offline buffering + retry

### Phase 4 (Week 11-12): Investor-ready
- Multi-tenant metrics
- Demo environment
- Security docs + architecture diagram

---

## 4) Step-by-step project creation (file creation included)

## Prerequisites
Install:
- Docker + Docker Compose
- Node 22+
- Go 1.23+
- Git

## 4.1 Folder structure banao

```bash
mkdir -p scannext/{apps/{web,api-gateway},services/{asset-scanner,rule-engine},deploy,docs}
cd scannext
```

## 4.2 Root files banao

Create **`docker-compose.yml`**:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: scannext
      POSTGRES_PASSWORD: scannext
      POSTGRES_DB: scannext
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

Create **`.env.example`**:

```env
POSTGRES_URL=postgres://scannext:scannext@localhost:5432/scannext?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
```

## 4.3 React app (dashboard)

```bash
cd apps
npm create vite@latest web -- --template react-ts
cd web
npm install
npm run dev
```

## 4.4 Node API Gateway

```bash
cd ../../apps
mkdir api-gateway && cd api-gateway
npm init -y
npm install express cors helmet jsonwebtoken pg ioredis zod dotenv
npm install -D typescript tsx @types/node @types/express
npx tsc --init
mkdir -p src
```

Create **`apps/api-gateway/src/index.ts`**:

```ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api-gateway' });
});

app.listen(8080, () => {
  console.log('API Gateway running on :8080');
});
```

Update **`apps/api-gateway/package.json`** scripts:

```json
{
  "scripts": {
    "dev": "tsx src/index.ts"
  }
}
```

Run:

```bash
npm run dev
```

## 4.5 Go service (asset scanner)

```bash
cd ../../services
mkdir asset-scanner && cd asset-scanner
go mod init github.com/your-org/scannext/asset-scanner
mkdir -p cmd/server
```

Create **`services/asset-scanner/cmd/server/main.go`**:

```go
package main

import (
	"encoding/json"
	"net/http"
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      true,
			"service": "asset-scanner",
		})
	})
	_ = http.ListenAndServe(":8090", nil)
}
```

Run:

```bash
go run ./cmd/server
```

## 4.6 Postgres schema (MVP)

Create **`docs/schema.sql`**:

```sql
create table if not exists tenants (
  id uuid primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists assets (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  ip inet not null,
  hostname text,
  criticality int default 3,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  asset_id uuid references assets(id),
  severity text not null,
  title text not null,
  status text not null default 'open',
  created_at timestamptz default now()
);
```

Apply:

```bash
docker compose up -d
psql "$POSTGRES_URL" -f docs/schema.sql
```

---

## 5) Production readiness checklist (MVP)

- Tenant isolation (row-level or schema-level)
- TLS everywhere (edge → cloud mandatory)
- Secrets in vault, not in code
- Centralized audit logs
- Backups + restore drill
- SLOs + monitoring (latency, ingest lag, queue depth)
- Basic incident response playbook

---

## 6) Investor-friendly packaging

Investors ko mostly ye chahiye:
- Clear ICP (e.g., manufacturing plants)
- SaaS + annual contracts
- Expansion story (asset visibility -> threat detection -> compliance)
- Defensible tech (OT protocol intelligence + deployment moat)

Pitch line:
> "Hybrid OT security platform: on-site visibility with cloud-scale analytics and workflow automation."

---

## 7) Next immediate actions (aaj se)

1. Hybrid architecture freeze karo
2. `docker-compose.yml` + React + API Gateway + Go health endpoints run karo
3. 3 demo screens banao: Assets, Alerts, Risk score
4. 1 design partner customer identify karo
5. Week-1 ke end tak clickable demo ready karo

Agar chaho to next step me mai aapko **exact folder-by-folder commands** aur **copy-paste starter files** de sakta hoon for:
- login/auth
- multi-tenant data model
- edge agent to cloud sync
- alert pipeline
