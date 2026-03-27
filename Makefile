.PHONY: up down logs merge-main check-conflicts resolve-pr-conflicts

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

merge-main:
	@git fetch origin
	@git merge origin/main

check-conflicts:
	@! rg -n "^(<<<<<<<|=======|>>>>>>>)" README.md apps/api-gateway/src/index.ts apps/web/src/App.tsx apps/web/src/styles.css docker-compose.yml

resolve-pr-conflicts:
	@git checkout --ours Makefile README.md apps/api-gateway/src/index.ts apps/web/src/App.tsx apps/web/src/styles.css docker-compose.yml || true
	@git add Makefile README.md apps/api-gateway/src/index.ts apps/web/src/App.tsx apps/web/src/styles.css docker-compose.yml
	@echo "Conflict files staged with current branch versions. Review changes, then run: git commit"
