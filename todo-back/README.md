# todo-back

Backend for `TK.Tasks` built with Go, chi, PostgreSQL and clean architecture.

## Requirements

- Go 1.25+
- Docker / Docker Compose
- `make`

## Quick start

```bash
make db-up
make migrate-up
make run
```

## Make commands

```bash
make help            # show commands
make run             # run HTTP server
make test            # run tests
make test-race       # run tests with race detector
make fmt             # format Go sources
make tidy            # sync Go module dependencies
make db-up           # start PostgreSQL
make db-down         # stop PostgreSQL
make db-logs         # follow PostgreSQL logs
make migrate-up      # apply migrations
make migrate-down    # rollback one migration
make migrate-create NAME=create_example
```

## HTTP check

```bash
curl http://localhost:8080/check
```

## Swagger UI

```txt
http://localhost:8080/docs
```

Raw OpenAPI YAML:

```txt
http://localhost:8080/docs/openapi.yml
```

## API groups

- `/api/v1` — front to back
- `/srv/v1` — back to back
- `/admin/v1` — admin API

## Architecture

The project is organized as clean architecture layers. Task management is implemented through domain, usecase, repository and HTTP adapter layers.

- `internal/domain` — enterprise/domain entities and value objects.
- `internal/usecase` — application business rules and ports.
- `internal/repository` — outbound adapters implementing usecase repository ports.
- `internal/infrastructure` — technical infrastructure such as PostgreSQL pool.
- `internal/interfaces/http` — inbound HTTP adapters, routers, handlers, docs, checks.
- `internal/app` — composition root and lifecycle wiring.

## Migrations

Migrations are stored in `migrations/` and run through the Docker image `migrate/migrate` from the Makefile.

Default migration database URL inside Docker Compose network:

```txt
postgres://todo:todo@postgres:5432/todo?sslmode=disable
```

You can override it:

```bash
make migrate-up DATABASE_URL='postgres://user:pass@localhost:5432/db?sslmode=disable'
```
