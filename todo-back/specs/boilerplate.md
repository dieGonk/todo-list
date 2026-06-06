# Boilerplate prompt: TK.Tasks backend

Используй этот документ как промпт, чтобы с нуля повторить backend-каркас приложения `TK.Tasks` в проекте `todo-back`.

## Контекст

Нужно создать backend scaffold для todo/planner приложения `TK.Tasks`.

Это именно каркас, без доменных сущностей и бизнес-фич. На этапе boilerplate не нужно заводить `Task`, task usecase, task repository или task handlers. Доменные сущности будут добавляться позже отдельными feature-итерациями.

## Основные требования

1. Язык: Go `1.25`.
2. База данных: PostgreSQL.
3. Структура: clean architecture.
4. Конфигурации: YAML.
5. Docker Compose для PostgreSQL.
6. HTTP router: `chi`.
7. Swagger UI по адресу `/docs`.
8. Raw OpenAPI YAML по адресу `/docs/openapi.yml`.
9. API groups:
   - `/api/v1` — front to back;
   - `/srv/v1` — back to back;
   - `/admin/v1` — admin API.
10. Заложить тесты.
11. Заложить HTTP check.
12. Добавить миграции БД.
13. Добавить Makefile для удобного запуска.

## Go dependencies

`go.mod`:

```go
module todo-back

go 1.25

require (
    github.com/go-chi/chi/v5 latest
    github.com/jackc/pgx/v5 latest
    gopkg.in/yaml.v3 latest
)
```

После создания файлов выполнить:

```bash
go mod tidy
```

## Итоговая структура проекта

Создай структуру:

```txt
todo-back/
  cmd/
    todo-back/
      main.go

  configs/
    local.yml
    test.yml

  docs/
    openapi/
      openapi.yml

  migrations/
    000001_init.up.sql
    000001_init.down.sql

  internal/
    app/
      app.go

    config/
      config.go
      config_test.go

    domain/
      .gitkeep

    usecase/
      .gitkeep

    repository/
      .gitkeep

    infrastructure/
      postgres/
        pool.go

    interfaces/
      http/
        check/
          handler.go
          handler_test.go
        docs/
          handler.go
          handler_test.go
        handlers/
          root.go
        middleware/
          .gitkeep
        router/
          router.go
          router_test.go

    pkg/
      logger/
        logger.go

  docker-compose.yml
  Makefile
  README.md
  .gitignore
  go.mod
```

Важно: директории `domain`, `usecase`, `repository`, `middleware` могут быть пустыми, но лучше положить туда `.gitkeep`, чтобы структура clean architecture была видна с самого начала.

## Clean architecture слои

Проект должен быть организован как clean architecture scaffold:

```txt
cmd              -> entrypoint
internal/app     -> composition root, lifecycle, dependency wiring
internal/domain  -> domain entities/value objects, пока пусто
internal/usecase -> application business rules and ports, пока пусто
internal/repository -> outbound adapters, пока пусто
internal/infrastructure -> technical infrastructure, PostgreSQL pool
internal/interfaces/http -> inbound HTTP adapters: router, handlers, docs, checks
internal/pkg     -> shared internal packages, e.g. logger
```

На этапе boilerplate НЕ создавать feature-specific сущности, например `Task`.

## Configs YAML

### configs/local.yml

```yml
app:
  name: todo-back
  env: local

http:
  host: 0.0.0.0
  port: 8080
  read_timeout: 5s
  write_timeout: 10s
  idle_timeout: 60s

postgres:
  host: localhost
  port: 5432
  database: todo
  user: todo
  password: todo
  ssl_mode: disable
  max_conns: 10
  min_conns: 1
  max_conn_lifetime: 1h
```

### configs/test.yml

```yml
app:
  name: todo-back
  env: test

http:
  host: 127.0.0.1
  port: 0
  read_timeout: 2s
  write_timeout: 2s
  idle_timeout: 10s

postgres:
  host: localhost
  port: 5432
  database: todo_test
  user: todo
  password: todo
  ssl_mode: disable
  max_conns: 2
  min_conns: 0
  max_conn_lifetime: 5m
```

## Config loader

Создай `internal/config/config.go`.

Требования:

- читать YAML-файл через `os.ReadFile`;
- парсить через `gopkg.in/yaml.v3`;
- поддерживать `time.Duration` из YAML (`5s`, `1h`);
- иметь методы:
  - `HTTPConfig.Addr() string`;
  - `PostgresConfig.DSN() string`.

Структуры:

```go
type Config struct {
    App      AppConfig      `yaml:"app"`
    HTTP     HTTPConfig     `yaml:"http"`
    Postgres PostgresConfig `yaml:"postgres"`
}

type AppConfig struct {
    Name string `yaml:"name"`
    Env  string `yaml:"env"`
}

type HTTPConfig struct {
    Host         string        `yaml:"host"`
    Port         int           `yaml:"port"`
    ReadTimeout  time.Duration `yaml:"read_timeout"`
    WriteTimeout time.Duration `yaml:"write_timeout"`
    IdleTimeout  time.Duration `yaml:"idle_timeout"`
}

type PostgresConfig struct {
    Host            string        `yaml:"host"`
    Port            int           `yaml:"port"`
    Database        string        `yaml:"database"`
    User            string        `yaml:"user"`
    Password        string        `yaml:"password"`
    SSLMode         string        `yaml:"ssl_mode"`
    MaxConns        int32         `yaml:"max_conns"`
    MinConns        int32         `yaml:"min_conns"`
    MaxConnLifetime time.Duration `yaml:"max_conn_lifetime"`
}
```

## Logger

Создай `internal/pkg/logger/logger.go`.

Используй стандартный `log/slog`.

Требования:

- JSON handler;
- для `local` и `test` уровень `Debug`;
- для остальных env уровень `Info`.

## PostgreSQL pool

Создай `internal/infrastructure/postgres/pool.go`.

Используй `github.com/jackc/pgx/v5/pgxpool`.

Функция:

```go
func NewPool(ctx context.Context, cfg config.PostgresConfig) (*pgxpool.Pool, error)
```

Требования:

- парсить DSN через `pgxpool.ParseConfig`;
- настроить:
  - `MaxConns`;
  - `MinConns`;
  - `MaxConnLifetime`;
- создать pool;
- сделать `Ping`;
- при ошибке ping закрыть pool.

## App lifecycle

Создай `internal/app/app.go`.

Требования:

- `App` хранит:
  - config;
  - logger;
  - `http.Server`;
  - `pgxpool.Pool`.
- `New(ctx, cfg, log)`:
  - создаёт PostgreSQL pool;
  - создаёт HTTP router;
  - создаёт `http.Server`.
- `Run(ctx)`:
  - запускает server в goroutine;
  - ждёт либо shutdown signal context, либо ошибку server;
  - корректно обрабатывает `http.ErrServerClosed`.
- `shutdown()`:
  - graceful shutdown с timeout `10s`;
  - закрывает DB pool.

Важно: app — composition root. Но на этапе scaffold не нужно wire-ить feature-specific usecases/repositories.

## Entrypoint

Создай `cmd/todo-back/main.go`.

Требования:

- CLI flag:

```txt
-config ./configs/local.yml
```

- загрузить config;
- создать logger;
- создать context с signal handling:
  - `os.Interrupt`;
  - `syscall.SIGTERM`;
- создать app;
- запустить app;
- при ошибках писать в logger и делать `os.Exit(1)`.

## HTTP router

Создай `internal/interfaces/http/router/router.go`.

Используй `github.com/go-chi/chi/v5`.

Middleware:

- `middleware.RequestID`;
- `middleware.RealIP`;
- `middleware.Recoverer`;
- `middleware.Heartbeat("/ping")`.

Routes:

```txt
GET /check
GET /docs
GET /docs/openapi.yml
GET /api/v1/
GET /srv/v1/
GET /admin/v1/
```

`Dependencies` пока содержит только logger:

```go
type Dependencies struct {
    Log *slog.Logger
}
```

`/api/v1`, `/srv/v1`, `/admin/v1` пока возвращают JSON message через generic handler.

Не добавлять feature-specific routes вроде `/api/v1/tasks` на этапе boilerplate.

## Generic message handler

Создай `internal/interfaces/http/handlers/root.go`.

```go
type MessageResponse struct {
    Message string `json:"message"`
}

func Message(message string) http.HandlerFunc
```

Ответ:

```json
{
  "message": "front to back api v1"
}
```

## HTTP check

Создай `internal/interfaces/http/check/handler.go`.

Endpoint:

```txt
GET /check
```

Response:

```json
{
  "status": "ok",
  "time": "2026-06-06T12:00:00Z"
}
```

Тип:

```go
type Response struct {
    Status string `json:"status"`
    Time   string `json:"time"`
}
```

`Time` форматировать как `time.RFC3339` в UTC.

## Swagger UI

Создай `internal/interfaces/http/docs/handler.go`.

Routes:

```txt
GET /docs
GET /docs/openapi.yml
```

### /docs

`/docs` должен отдавать полноценный Swagger UI, а не просто ссылку на YAML.

Используй стандартную стилистику Swagger UI, без кастомизации под дизайн приложения.

HTML должен подключать:

```html
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
```

И инициализировать:

```js
SwaggerUIBundle({
  url: '/docs/openapi.yml',
  dom_id: '#swagger-ui',
  deepLinking: true,
  displayRequestDuration: true,
  persistAuthorization: true,
});
```

Не добавлять кастомные CSS-стили, кроме стандартного подключения swagger-ui.css.

### /docs/openapi.yml

Должен читать файл:

```txt
docs/openapi/openapi.yml
```

И отдавать его с content-type:

```txt
application/yaml; charset=utf-8
```

## OpenAPI spec

Создай `docs/openapi/openapi.yml`.

На этапе scaffold описать только базовые endpoints:

- `/check`
- `/api/v1`
- `/srv/v1`
- `/admin/v1`

Не описывать `Task` и `/api/v1/tasks` до появления feature.

Пример схем:

```yml
components:
  schemas:
    CheckResponse:
      type: object
      required: [status, time]
      properties:
        status:
          type: string
          example: ok
        time:
          type: string
          format: date-time
    MessageResponse:
      type: object
      required: [message]
      properties:
        message:
          type: string
```

## Docker Compose

Создай `docker-compose.yml`.

Services:

### postgres

```yml
postgres:
  image: postgres:17-alpine
  container_name: todo-back-postgres
  environment:
    POSTGRES_DB: todo
    POSTGRES_USER: todo
    POSTGRES_PASSWORD: todo
  ports:
    - "5432:5432"
  volumes:
    - todo_back_pg_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U todo -d todo"]
    interval: 5s
    timeout: 3s
    retries: 10
```

### migrate

Используй Docker image:

```txt
migrate/migrate:v4.18.3
```

```yml
migrate:
  image: migrate/migrate:v4.18.3
  profiles: ["tools"]
  volumes:
    - ./migrations:/migrations
  depends_on:
    postgres:
      condition: service_healthy
```

Volume:

```yml
volumes:
  todo_back_pg_data:
```

## Migrations

Создай папку:

```txt
migrations/
```

Первая миграция:

### migrations/000001_init.up.sql

```sql
-- Initial database migration for todo-back scaffold.
-- Domain tables will be added in feature-specific migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### migrations/000001_init.down.sql

```sql
-- Rollback for initial scaffold migration.
-- Keep pgcrypto extension because it can be shared by other database objects.
```

Не создавать доменные таблицы на этапе scaffold.

## Makefile

Создай `Makefile`.

Переменные:

```make
CONFIG ?= ./configs/local.yml
DATABASE_URL ?= postgres://todo:todo@postgres:5432/todo?sslmode=disable
MIGRATIONS_DIR ?= /migrations
```

Targets:

```make
help
run
test
test-race
fmt
tidy
db-up
db-down
db-logs
migrate-up
migrate-down
migrate-force
migrate-create
```

Поведение:

```make
run:
    go run ./cmd/todo-back -config $(CONFIG)

test:
    go test ./...

test-race:
    go test -race ./...

fmt:
    gofmt -w ./cmd ./internal

tidy:
    go mod tidy

db-up:
    docker compose up -d postgres

db-down:
    docker compose down

db-logs:
    docker compose logs -f postgres

migrate-up:
    docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up

migrate-down:
    docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down 1

migrate-force:
    docker compose run --rm migrate -path=$(MIGRATIONS_DIR) -database "$(DATABASE_URL)" force $(VERSION)

migrate-create:
    docker compose run --rm migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)
```

`help` target должен выводить список команд через grep/awk по комментариям `##`.

## Tests

Добавь базовые тесты.

### Config test

Файл:

```txt
internal/config/config_test.go
```

Проверить:

- `configs/local.yml` загружается;
- `App.Name == "todo-back"`;
- `HTTP.Port == 8080`;
- `HTTP.ReadTimeout == 5*time.Second`.

### Check handler test

Файл:

```txt
internal/interfaces/http/check/handler_test.go
```

Проверить:

- `GET /check` возвращает `200`;
- JSON декодируется;
- `status == "ok"`.

### Docs handler test

Файл:

```txt
internal/interfaces/http/docs/handler_test.go
```

Проверить:

- `/docs` возвращает `200`;
- body содержит `SwaggerUIBundle`;
- body содержит `/docs/openapi.yml`.

### Router test

Файл:

```txt
internal/interfaces/http/router/router_test.go
```

Проверить:

- `/check` возвращает `200`;
- `/api/v1/` возвращает `200`;
- `/srv/v1/` возвращает `200`;
- `/admin/v1/` возвращает `200`.

## README

Создай `README.md` с разделами:

- Requirements;
- Quick start;
- Make commands;
- HTTP check;
- Swagger UI;
- API groups;
- Architecture;
- Migrations.

Quick start:

```bash
make db-up
make migrate-up
make run
```

Swagger:

```txt
http://localhost:8080/docs
```

Raw OpenAPI:

```txt
http://localhost:8080/docs/openapi.yml
```

## .gitignore

```gitignore
bin/
dist/
.env
*.log
.DS_Store
coverage.out
```

## Validation

После генерации выполнить:

```bash
gofmt -w ./cmd ./internal
go mod tidy
go test ./...
make help
```

Ожидаемый результат:

- tests pass;
- diagnostics clean;
- `make help` показывает команды;
- `/docs` открывает стандартный Swagger UI;
- `/check` возвращает JSON status ok.

## Что НЕ делать в boilerplate

Не создавать:

- `Task` entity;
- task usecase;
- task repository;
- task HTTP handlers;
- `/api/v1/tasks` routes;
- task schemas в OpenAPI;
- доменные таблицы задач в первой миграции.

Все feature-specific части добавляются позже отдельными итерациями.
