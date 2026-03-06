.PHONY: up down logs logs-backend reset build ps help

up:
	cp -n .env.example .env 2>/dev/null || true
	docker compose up -d --build
	@echo ""
	@echo "✅ Started. Open http://localhost:$${FRONTEND_PORT:-80}"

down:
	docker compose down

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

reset:
	docker compose down -v
	docker compose up -d --build
	@echo ""
	@echo "✅ Database reset. Open http://localhost:$${FRONTEND_PORT:-80}"

build:
	docker compose build

ps:
	docker compose ps

help:
	@echo ""
	@echo "vibe-ecommerce Docker commands:"
	@echo "  make up       - Start all containers"
	@echo "  make down     - Stop all containers"
	@echo "  make logs     - Follow all logs"
	@echo "  make reset    - Reset database (clear all data)"
	@echo "  make build    - Build images only"
	@echo "  make ps       - Show container status"
	@echo ""
