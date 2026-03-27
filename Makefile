.PHONY: up down logs check-conflicts

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

check-conflicts:
	@! rg -n "^(<<<<<<<|=======|>>>>>>>)" README.md apps/api-gateway/src/index.ts apps/web/src/App.tsx apps/web/src/styles.css docker-compose.yml
