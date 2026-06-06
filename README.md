# TK.Tasks

`TK.Tasks` — todo/planner приложение с React frontend и Go backend.

## Структура проекта

```txt
todo-list/
  design-reference/   # дизайн-референс и прототип интерфейса
  todo-front/         # React frontend
  todo-back/          # Go backend
```

## Требования

### Frontend

- Node.js 20+
- npm

### Backend

- Go 1.25+
- Docker / Docker Compose
- make

## Быстрый запуск

### 1. Запустить PostgreSQL

```bash
cd todo-back
make db-up
```

### 2. Применить миграции

```bash
make migrate-up
```

### 3. Запустить backend

```bash
make run
```

Backend будет доступен по адресу:

```txt
http://localhost:8080
```

Проверка backend:

```bash
curl http://localhost:8080/check
```

Swagger UI:

```txt
http://localhost:8080/docs
```

Raw OpenAPI YAML:

```txt
http://localhost:8080/docs/openapi.yml
```

### 4. Настроить frontend env

В отдельном терминале:

```bash
cd todo-front
cp .env.example .env
```

По умолчанию frontend будет обращаться к backend по адресу:

```txt
http://localhost:8080/api/v1
```

Если backend запущен по другому адресу, измени `todo-front/.env`:

```env
VITE_API_URL=https://api.example.com/api/v1
```

### 5. Запустить frontend

```bash
npm install
npm run dev
```

Frontend будет доступен по адресу Vite, обычно:

```txt
http://localhost:5173
```

## Backend команды

Из директории `todo-back`:

```bash
make help
```

Основные команды:

```bash
make run             # запустить HTTP server
make test            # запустить тесты
make test-race       # запустить тесты с race detector
make fmt             # отформатировать Go-код
make tidy            # обновить go.mod/go.sum
make db-up           # поднять PostgreSQL
make db-down         # остановить PostgreSQL
make db-logs         # смотреть логи PostgreSQL
make migrate-up      # применить миграции
make migrate-down    # откатить одну миграцию
make migrate-create NAME=create_example
```

Backend конфиг по умолчанию:

```txt
todo-back/configs/local.yml
```

Запуск с другим конфигом:

```bash
make run CONFIG=./configs/test.yml
```

## Frontend команды

Из директории `todo-front`:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

Frontend использует RTK Query и обращается к backend API по адресу из переменной окружения `VITE_API_URL`. Если переменная не задана, используется fallback `http://localhost:8080/api/v1`.

## Проверки

### Backend

```bash
cd todo-back
go test ./...
```

или:

```bash
cd todo-back
make test
```

### Frontend

```bash
cd todo-front
npm run build
```

## Environment variables

### Frontend

Файл локальной конфигурации:

```txt
todo-front/.env
```

Пример:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Важно: в Vite переменные окружения, доступные в browser-коде, должны начинаться с `VITE_`.

Также важно: `VITE_API_URL` подставляется на этапе сборки frontend. Для production build нужно задавать её перед `npm run build`:

```bash
VITE_API_URL=https://api.example.com/api/v1 npm run build
```

## Полезные URL

```txt
Frontend:        http://localhost:5173
Backend:         http://localhost:8080
HTTP check:      http://localhost:8080/check
Swagger UI:      http://localhost:8080/docs
OpenAPI YAML:    http://localhost:8080/docs/openapi.yml
PostgreSQL:      localhost:5432
```

## Остановка окружения

```bash
cd todo-back
make db-down
```

## Примечания

- `todo-back` содержит базовый API управления задачами и подзадачами.
- `todo-front` использует backend API через RTK Query.
- Перед запуском backend нужно поднять PostgreSQL и применить миграции.
