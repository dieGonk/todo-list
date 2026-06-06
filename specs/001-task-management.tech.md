# 001. Управление задачами — техническая спека

## 1. Цель реализации

Реализовать feature `task management` для `TK.Tasks`:

- добавить доменную модель задач в backend;
- добавить PostgreSQL миграции;
- реализовать clean architecture слои backend;
- реализовать REST API на `/api/v1`;
- обновить OpenAPI;
- переключить frontend RTK Query с временного `localStorage` adapter на HTTP API backend;
- сохранить текущий UI и дизайн frontend.

## 2. Архитектурные границы

### Backend

Backend должен следовать dependency rule:

```txt
interfaces/http -> usecase -> domain
repository/postgres -> usecase ports
app -> wires everything
```

Слои:

```txt
internal/domain/task       # entities, value objects, validation constants
internal/usecase/task      # application service, DTO, repository ports
internal/repository/task   # PostgreSQL implementation of usecase port
internal/interfaces/http/handlers/task # HTTP adapter
internal/app               # composition root
```

### Frontend

Frontend уже имеет структуру:

```txt
entities/task/api/tasksApi.ts
entities/task/model/types.ts
entities/task/model/constants.ts
widgets/task-list
pages/task-detail
pages/calendar
widgets/dashboard-summary
```

Нужно заменить реализацию `tasksApi.ts` на HTTP endpoints, сохранив public RTK Query hooks там, где возможно.

## 3. Backend database design

## 3.1. Таблица `tasks`

Создать миграцию:

```txt
migrations/000002_create_tasks.up.sql
migrations/000002_create_tasks.down.sql
```

DDL:

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    task_date DATE NOT NULL,
    task_time TIME NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    starred BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT tasks_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT tasks_category_check CHECK (category IN ('work', 'personal', 'health', 'learning', 'home')),
    CONSTRAINT tasks_priority_check CHECK (priority IN ('high', 'med', 'low'))
);

CREATE INDEX idx_tasks_task_date ON tasks (task_date);
CREATE INDEX idx_tasks_done ON tasks (done);
CREATE INDEX idx_tasks_starred ON tasks (starred);
CREATE INDEX idx_tasks_category ON tasks (category);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_created_at ON tasks (created_at DESC);
```

## 3.2. Таблица `subtasks`

```sql
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subtasks_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE INDEX idx_subtasks_task_id ON subtasks (task_id);
```

## 3.3. Updated at trigger

Можно добавить SQL-функцию:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subtasks_updated_at
BEFORE UPDATE ON subtasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

Down migration должна удалить:

- triggers;
- function, если больше не используется;
- `subtasks`;
- `tasks`.

## 4. Backend domain model

Создать:

```txt
internal/domain/task/task.go
```

Типы:

```go
type Category string

const (
    CategoryWork     Category = "work"
    CategoryPersonal Category = "personal"
    CategoryHealth   Category = "health"
    CategoryLearning Category = "learning"
    CategoryHome     Category = "home"
)

type Priority string

const (
    PriorityHigh   Priority = "high"
    PriorityMedium Priority = "med"
    PriorityLow    Priority = "low"
)

type Subtask struct {
    ID        string
    TaskID    string
    Title     string
    Done      bool
    CreatedAt time.Time
    UpdatedAt time.Time
}

type Task struct {
    ID        string
    Title     string
    Category  Category
    Priority  Priority
    Date      time.Time
    Time      string
    Notes     string
    Done      bool
    Starred   bool
    Subtasks  []Subtask
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

Добавить helpers:

```go
func IsValidCategory(value Category) bool
func IsValidPriority(value Priority) bool
```

## 5. Backend usecase layer

Создать:

```txt
internal/usecase/task/ports.go
internal/usecase/task/dto.go
internal/usecase/task/service.go
internal/usecase/task/errors.go
```

### 5.1. Repository port

```go
type Repository interface {
    List(ctx context.Context, filter ListFilter) ([]domain.Task, error)
    GetByID(ctx context.Context, id string) (*domain.Task, error)
    Create(ctx context.Context, input CreateInput) (*domain.Task, error)
    Update(ctx context.Context, id string, input UpdateInput) (*domain.Task, error)
    Delete(ctx context.Context, id string) error
    AddSubtask(ctx context.Context, taskID string, input AddSubtaskInput) (*domain.Subtask, error)
    ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error)
}
```

### 5.2. DTO

```go
type ListFilter struct {
    Filter   string
    Category string
    Query    string
    Sort     string
}

type CreateInput struct {
    Title    string
    Category domain.Category
    Priority domain.Priority
}

type UpdateInput struct {
    Title    *string
    Category *domain.Category
    Priority *domain.Priority
    Date     *time.Time
    Time     *string
    Notes    *string
    Done     *bool
    Starred  *bool
}

type AddSubtaskInput struct {
    Title string
}
```

### 5.3. Usecase errors

```go
var (
    ErrInvalidInput = errors.New("invalid input")
    ErrNotFound     = errors.New("not found")
)
```

Для простоты на первом этапе можно использовать sentinel errors и HTTP adapter будет маппить их в статусы.

### 5.4. Validation

В usecase service:

- trim title;
- title not empty;
- validate category;
- validate priority;
- validate time format `HH:mm` for updates;
- default create date = today;
- default create time = current local time `HH:mm`.

## 6. Backend repository layer

Создать:

```txt
internal/repository/task/postgres.go
```

Repository должен использовать `pgxpool.Pool`.

### 6.1. List

Фильтры:

- `filter=today` — `task_date = CURRENT_DATE`;
- `filter=upcoming` — `task_date > CURRENT_DATE AND done = FALSE`;
- `filter=done` — `done = TRUE`;
- `filter=starred` — `starred = TRUE`;
- `filter=all` или пусто — без status-фильтра;
- `category` — если не пусто и не `all`, `category = $x`;
- `query` — `title ILIKE '%' || query || '%'`;
- `sort=time` — `ORDER BY done ASC, task_date ASC, task_time ASC`;
- `sort=priority` — high, med, low через `CASE`.

Нужно возвращать задачи вместе с подзадачами.

Рекомендуемый подход для первого этапа:

1. Получить список задач.
2. Получить subtasks для найденных task ids одним запросом.
3. Сгруппировать subtasks в Go.

### 6.2. GetByID

Получить задачу по id и связанные subtasks.

Если не найдена — вернуть `usecase.ErrNotFound`.

### 6.3. Create

Insert в `tasks`.

Возвращать созданную задачу с пустым `Subtasks`.

### 6.4. Update

Partial update.

Можно реализовать динамический SQL builder вручную.

Если нет полей для обновления — вернуть текущую задачу.

После update вернуть полную задачу через `GetByID`.

### 6.5. Delete

Delete by id.

Если `RowsAffected == 0` — `ErrNotFound`.

### 6.6. AddSubtask

Проверить, что task существует.

Insert в `subtasks`.

### 6.7. ToggleSubtask

Update:

```sql
UPDATE subtasks
SET done = NOT done
WHERE id = $1 AND task_id = $2
RETURNING ...
```

Если нет строки — `ErrNotFound`.

## 7. Backend HTTP API

Создать:

```txt
internal/interfaces/http/handlers/task/handler.go
```

Handler зависит от usecase interface, не от repository.

### 7.1. Routes

Подключить в router:

```txt
/api/v1/tasks
```

Endpoints:

```txt
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{taskID}
PATCH  /api/v1/tasks/{taskID}
DELETE /api/v1/tasks/{taskID}
POST   /api/v1/tasks/{taskID}/subtasks
PATCH  /api/v1/tasks/{taskID}/subtasks/{subtaskID}/toggle
```

### 7.2. Request/response JSON

Frontend ожидает camelCase fields:

```json
{
  "id": "...",
  "title": "...",
  "category": "work",
  "priority": "high",
  "date": "2026-06-06",
  "time": "10:00",
  "notes": "...",
  "done": false,
  "starred": true,
  "subtasks": [
    {
      "id": "...",
      "title": "...",
      "done": false
    }
  ]
}
```

Use frontend names:

- `category`, not `cat`;
- `priority`, not `prio`;
- `subtasks`, not `subs`.

### 7.3. Error response

Standard error JSON:

```json
{
  "code": "invalid_input",
  "message": "Title is required"
}
```

Mapping:

| Error | HTTP |
| --- | --- |
| invalid JSON | 400 |
| validation error | 400 |
| not found | 404 |
| internal error | 500 |

## 8. Backend OpenAPI

Обновить:

```txt
docs/openapi/openapi.yml
```

Добавить:

- schemas:
  - `Task`;
  - `Subtask`;
  - `CreateTaskRequest`;
  - `UpdateTaskRequest`;
  - `AddSubtaskRequest`;
  - `ErrorResponse`.
- paths для всех task endpoints.

Swagger UI остается стандартным по `/docs`.

## 9. Backend app wiring

В `internal/app/app.go`:

```go
taskRepository := taskrepo.NewPostgresRepository(db)
taskService := taskusecase.NewService(taskRepository)

httpRouter := router.New(router.Dependencies{
    Log: log,
    TaskUseCase: taskService,
})
```

В `router.Dependencies` добавить:

```go
TaskUseCase taskhandler.UseCase
```

## 10. Frontend changes

### 10.1. Config

Добавить `.env` или использовать default:

```txt
VITE_API_URL=http://localhost:8080/api/v1
```

В `baseApi` сейчас base URL может быть `http://localhost:8080/api`. Нужно привести к одному варианту.

Рекомендуется:

```ts
baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
```

### 10.2. RTK Query

Обновить:

```txt
todo-front/src/entities/task/api/tasksApi.ts
```

Убрать `localStorage` adapter.

Endpoints:

```ts
getTasks: GET /tasks
getTaskById: GET /tasks/:id
createTask: POST /tasks
toggleTaskDone: PATCH /tasks/:id
toggleTaskStar: PATCH /tasks/:id
setTaskPriority: PATCH /tasks/:id
addSubtask: POST /tasks/:id/subtasks
toggleSubtask: PATCH /tasks/:id/subtasks/:subtaskId/toggle
deleteTask: DELETE /tasks/:id
```

Use RTK Query `query`/`mutation`, not `queryFn`.

### 10.3. Existing hooks compatibility

Сохранить существующие exports, чтобы UI минимально менять:

```ts
useGetTasksQuery
useGetTaskByIdQuery
useCreateTaskMutation
useToggleTaskDoneMutation
useToggleTaskStarMutation
useSetTaskPriorityMutation
useAddSubtaskMutation
useDeleteTaskMutation
```

Добавить:

```ts
useToggleSubtaskMutation
```

### 10.4. UI updates

Проверить страницы:

- Dashboard;
- Tasks;
- TaskDetail;
- Calendar.

Нужно:

- показывать loading states;
- показывать empty states;
- обрабатывать 404 в деталях;
- после mutation обновлять cache через `invalidatesTags`.

### 10.5. Подзадачи

Сейчас UI может отображать Check для подзадач без handler. Нужно подключить `toggleSubtask`.

## 11. Tests

### Backend tests

Добавить unit tests:

- usecase validation;
- HTTP handler invalid JSON;
- HTTP handler not found mapping;
- repository can be covered later integration tests.

Для repository желательно добавить integration tests позже, когда будет тестовая БД или testcontainers.

### Frontend checks

Минимально:

```bash
npm run build
```

## 12. Implementation plan

### Step 1. Backend migrations

- создать `000002_create_tasks`;
- применить миграции через `make migrate-up`.

### Step 2. Backend domain/usecase

- добавить domain task;
- добавить usecase ports/dto/errors/service;
- покрыть validation unit tests.

### Step 3. Backend repository

- реализовать PostgreSQL repository;
- вручную проверить через API после wiring.

### Step 4. Backend HTTP handlers

- добавить task handlers;
- подключить routes;
- добавить handler tests.

### Step 5. OpenAPI

- обновить OpenAPI;
- проверить `/docs`.

### Step 6. Frontend API

- заменить localStorage RTK Query на HTTP;
- сохранить hooks;
- добавить `toggleSubtask`.

### Step 7. Frontend UI fixes

- проверить задачи;
- детали;
- dashboard;
- calendar;
- loading/error states.

### Step 8. Validation

Выполнить:

```bash
cd todo-back
make test

cd ../todo-front
npm run build
```

## 13. Acceptance checklist

- [ ] Backend migration creates `tasks` and `subtasks`.
- [ ] Backend domain task exists.
- [ ] Backend usecase task exists.
- [ ] Backend repository task exists.
- [ ] Backend task HTTP handlers exist.
- [ ] `/api/v1/tasks` endpoints work.
- [ ] `/docs` shows updated Swagger UI.
- [ ] Frontend RTK Query uses HTTP backend.
- [ ] Create task works and persists in PostgreSQL.
- [ ] List tasks works after page reload.
- [ ] Task detail works.
- [ ] Toggle done works.
- [ ] Toggle starred works.
- [ ] Set priority works.
- [ ] Delete task works.
- [ ] Add subtask works.
- [ ] Toggle subtask works.
- [ ] Dashboard uses backend data.
- [ ] Calendar uses backend data.
- [ ] Backend tests pass.
- [ ] Frontend build passes.
