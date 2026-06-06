.PHONY: help run test test-race fmt tidy db-up db-down db-logs migrate-up migrate-down migrate-force migrate-create

CONFIG ?= ./configs/local.yml
DATABASE_URL ?= postgres://todo:todo@postgres:5432/todo?sslmode=disable
MIGRATIONS_DIR ?= /migrations

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-18s %s\n", $$1, $$2}'

run: ## Run HTTP server
	go run ./cmd/todo-back -config $(CONFIG)

test: ## Run tests
	go test ./...

test-race: ## Run tests with race detector
	go test -race ./...

fmt: ## Format Go sources
	gofmt -w ./cmd ./internal

tidy: ## Sync Go module dependencies
	go mod tidy

db-up: ## Start PostgreSQL with docker compose
	docker compose up -d postgres

db-down: ## Stop PostgreSQL and remove containers
	docker compose down

db-logs: ## Follow PostgreSQL logs
	docker compose logs -f postgres

migrate-up: ## Apply all database migrations
	docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up

migrate-down: ## Rollback one database migration
	docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down 1

migrate-force: ## Force migration version, usage: make migrate-force VERSION=1
	docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" force $(VERSION)

migrate-create: ## Create migration files, usage: make migrate-create NAME=create_users
	docker compose run --rm migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)
