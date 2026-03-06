.PHONY: up down logs logs-backend reset build ps help

# Auto-detect docker compose command (v2 plugin or v1 standalone)
DOCKER_COMPOSE := $(shell docker compose version > /dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

up:
	cp -n .env.example .env 2>/dev/null || true
	$(DOCKER_COMPOSE) up -d --build
	@echo ""
	@echo "✅ Started. Open http://localhost:$${FRONTEND_PORT:-80}"

down:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

logs-backend:
	$(DOCKER_COMPOSE) logs -f backend

reset:
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d --build
	@echo ""
	@echo "✅ Database reset. Open http://localhost:$${FRONTEND_PORT:-80}"

build:
	$(DOCKER_COMPOSE) build

ps:
	$(DOCKER_COMPOSE) ps

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
	@echo "Using: $(DOCKER_COMPOSE)"
