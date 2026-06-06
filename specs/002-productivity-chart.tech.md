# 002. График продуктивности — техническая спека

## 1. Цель реализации

Реализовать dashboard-график продуктивности в соответствии с референсом:

- добавить backend endpoint статистики;
- добавить usecase/repository слой для статистики;
- обновить OpenAPI;
- добавить frontend RTK Query endpoint;
- заменить fake chart на SVG area chart;
- сохранить текущую стилистику dark/gold дизайн-системы.

## 2. Backend API

Добавить endpoint:

```txt
GET /api/v1/stats/productivity
```

На текущем этапе endpoint возвращает статистику за последние 7 календарных дней.

## 3. Response contract

```json
{
  "summary": {
    "inProgress": 7,
    "completed": 12,
    "upcoming": 3
  },
  "range": {
    "from": "2026-06-01",
    "to": "2026-06-07"
  },
  "points": [
    {
      "date": "2026-06-01",
      "label": "Пн",
      "completed": 5
    }
  ]
}
```

Types:

```go
type ProductivitySummary struct {
    InProgress int `json:"inProgress"`
    Completed  int `json:"completed"`
    Upcoming   int `json:"upcoming"`
}

type ProductivityRange struct {
    From string `json:"from"`
    To   string `json:"to"`
}

type ProductivityPoint struct {
    Date      string `json:"date"`
    Label     string `json:"label"`
    Completed int    `json:"completed"`
}

type ProductivityResponse struct {
    Summary ProductivitySummary `json:"summary"`
    Range   ProductivityRange   `json:"range"`
    Points  []ProductivityPoint `json:"points"`
}
```

## 4. Backend architecture

Добавить новую feature область `stats`:

```txt
internal/usecase/stats/
  dto.go
  ports.go
  service.go

internal/repository/stats/
  postgres.go

internal/interfaces/http/handlers/stats/
  handler.go
```

Dependency direction:

```txt
interfaces/http/handlers/stats -> usecase/stats -> repository port
repository/stats -> usecase/stats port
app -> wires repository + service + router
```

## 5. Backend usecase layer

### 5.1. DTO

Файл:

```txt
internal/usecase/stats/dto.go
```

```go
type ProductivitySummary struct {
    InProgress int
    Completed  int
    Upcoming   int
}

type ProductivityRange struct {
    From time.Time
    To   time.Time
}

type ProductivityPoint struct {
    Date      time.Time
    Label     string
    Completed int
}

type Productivity struct {
    Summary ProductivitySummary
    Range   ProductivityRange
    Points  []ProductivityPoint
}
```

### 5.2. Ports

Файл:

```txt
internal/usecase/stats/ports.go
```

```go
type Repository interface {
    GetProductivity(ctx context.Context, from time.Time, to time.Time) (*Productivity, error)
}
```

### 5.3. Service

Файл:

```txt
internal/usecase/stats/service.go
```

```go
type Service struct {
    repository Repository
    now func() time.Time
}

func NewService(repository Repository) *Service
func (s *Service) GetProductivity(ctx context.Context) (*Productivity, error)
```

Service должен:

- вычислить `to` как сегодняшнюю дату;
- вычислить `from = to - 6 days`;
- нормализовать даты к началу дня;
- вызвать repository.

## 6. Backend repository layer

Файл:

```txt
internal/repository/stats/postgres.go
```

Repository использует `pgxpool.Pool`.

### 6.1. Summary query

```sql
SELECT
  COUNT(*) FILTER (WHERE done = FALSE) AS in_progress,
  COUNT(*) FILTER (WHERE done = TRUE) AS completed,
  COUNT(*) FILTER (WHERE done = FALSE AND task_date > CURRENT_DATE) AS upcoming
FROM tasks;
```

### 6.2. Daily completed query

На текущем этапе считать completed по `updated_at`, если `done = true`:

```sql
SELECT
  updated_at::date AS day,
  COUNT(*) AS completed
FROM tasks
WHERE done = TRUE
  AND updated_at::date BETWEEN $1 AND $2
GROUP BY updated_at::date;
```

Repository должен вернуть ровно 7 points. Если в какой-то день нет выполненных задач — `completed = 0`.

### 6.3. Labels

Labels можно формировать в Go по weekday:

```txt
Пн, Вт, Ср, Чт, Пт, Сб, Вс
```

## 7. Backend HTTP handler

Файл:

```txt
internal/interfaces/http/handlers/stats/handler.go
```

Handler interface:

```go
type UseCase interface {
    GetProductivity(ctx context.Context) (*stats.Productivity, error)
}
```

Route registration:

```go
func (h *Handler) Register(r chi.Router) {
    r.Get("/productivity", h.GetProductivity)
}
```

Response mapping:

- `time.Time` dates format as `YYYY-MM-DD`;
- all JSON fields camelCase.

Errors:

- unexpected errors -> `500`;
- error response:

```json
{
  "code": "internal_error",
  "message": "Internal server error"
}
```

## 8. Backend router/app wiring

### 8.1. app.go

Add wiring:

```go
statsRepository := statsrepo.NewPostgresRepository(db)
statsService := statsusecase.NewService(statsRepository)
```

Router dependencies:

```go
router.Dependencies{
    Log: log,
    TaskUseCase: taskService,
    StatsUseCase: statsService,
}
```

### 8.2. router.go

Add dependency:

```go
StatsUseCase statshandler.UseCase
```

Add route under `/api/v1`:

```go
r.Route("/stats", statshandler.NewHandler(deps.StatsUseCase, deps.Log).Register)
```

Final endpoint:

```txt
GET /api/v1/stats/productivity
```

## 9. OpenAPI update

Update:

```txt
todo-back/docs/openapi/openapi.yml
```

Add path:

```txt
/api/v1/stats/productivity
```

Add schemas:

- `ProductivityResponse`;
- `ProductivitySummary`;
- `ProductivityRange`;
- `ProductivityPoint`.

## 10. Frontend API layer

Добавить новую shared/entity API область.

Вариант A — создать отдельную entity:

```txt
todo-front/src/entities/stats/api/statsApi.ts
```

Вариант B — временно добавить endpoint в existing base API рядом с dashboard widget.

Рекомендуется вариант A.

Types:

```ts
export type ProductivitySummary = {
  inProgress: number;
  completed: number;
  upcoming: number;
};

export type ProductivityRange = {
  from: string;
  to: string;
};

export type ProductivityPoint = {
  date: string;
  label: string;
  completed: number;
};

export type Productivity = {
  summary: ProductivitySummary;
  range: ProductivityRange;
  points: ProductivityPoint[];
};
```

RTK Query:

```ts
export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductivity: builder.query<Productivity, void>({
      query: () => '/stats/productivity',
      providesTags: ['Stats'],
    }),
  }),
});
```

Update `baseApi.tagTypes`:

```ts
tagTypes: ['Task', 'Stats']
```

## 11. Frontend chart component

Создать shared/widget component:

```txt
todo-front/src/widgets/productivity-chart/ProductivityChart.tsx
```

Или внутри dashboard widget, если хочется меньше файлов.

Рекомендуется отдельный widget.

Props:

```ts
type ProductivityChartProps = {
  points: ProductivityPoint[];
};
```

Реализовать SVG area chart без сторонних библиотек.

## 12. Area chart algorithm

Use dimensions:

```ts
const W = 520;
const H = 200;
const pad = 10;
```

Inputs:

```ts
const data = points.map((point) => point.completed);
const labels = points.map((point) => point.label);
const peakIndex = data.indexOf(Math.max(...data));
```

Compute:

```ts
const max = Math.max(...data) * 1.15 || 1;
const xs = data.map((_, i) => pad + (i * (W - pad * 2)) / (data.length - 1));
const ys = data.map((value) => H - 8 - (value / max) * (H - 30));
```

Build smooth line with Catmull-Rom to Bezier, like reference.

Render:

- area fill gradient;
- line stroke `var(--gold)`;
- vertical dashed line for peak;
- circle point for peak;
- label `${data[peakIndex]} задач`;
- x-axis labels.

Edge case:

- if all values are zero, still render flat line and no misleading peak label, or show label `0 задач` on last point.

## 13. Dashboard integration

Update:

```txt
todo-front/src/widgets/dashboard-summary/DashboardSummary.tsx
```

Current dashboard already fetches tasks and calculates local stats.

Change productivity card:

- fetch `useGetProductivityQuery()`;
- use `productivity.summary` for legend metrics;
- use `productivity.points` for chart;
- remove fake bar chart.

Keep task list / day progress calculations from tasks for now, unless they are duplicated.

## 14. Styling

Use existing CSS classes and add missing ones:

```css
.chart-wrap
.chart-svg
.x-axis
.legend
.legend .li
.legend .li .d
.legend .li .v
.legend .li .t
```

Styling should follow reference:

- gold line;
- gold area fill;
- dark card background;
- compact legend;
- adaptive width.

No chart library.

## 15. Loading/error states

In `DashboardSummary`:

- `isLoading`: show `Загружаем статистику…` or skeleton inside chart card;
- `isError`: show `Не удалось загрузить статистику`;
- no data: render 7 zero points.

## 16. Tests and validation

### Backend

Add unit test for stats service date range if practical.

Run:

```bash
cd todo-back
make test
```

### Frontend

Run:

```bash
cd todo-front
npm run build
```

## 17. Implementation plan

1. Backend usecase/repository/handler for stats.
2. Wire route `/api/v1/stats/productivity`.
3. Update OpenAPI.
4. Add frontend stats entity API.
5. Add SVG area chart component.
6. Replace fake chart in dashboard.
7. Validate backend tests.
8. Validate frontend build.

## 18. Acceptance checklist

- [ ] `GET /api/v1/stats/productivity` works.
- [ ] Endpoint returns summary and exactly 7 points.
- [ ] OpenAPI has stats endpoint and schemas.
- [ ] Frontend has `useGetProductivityQuery`.
- [ ] Dashboard uses backend stats for productivity card.
- [ ] Fake bar chart removed.
- [ ] SVG area chart visually matches reference.
- [ ] Peak point is highlighted.
- [ ] Empty/zero data works.
- [ ] Backend tests pass.
- [ ] Frontend build passes.
