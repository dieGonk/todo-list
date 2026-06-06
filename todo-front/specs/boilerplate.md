# Boilerplate prompt: TK.Tasks frontend

Используй этот документ как промпт, чтобы с нуля повторить frontend-каркас приложения `TK.Tasks` в проекте `todo-front`.

## Контекст проекта

Нужно создать React frontend для todo/planner приложения в стилистике дизайн-референса `design-reference`.

Приложение называется:

```txt
TK.Tasks — Личный планировщик
```

Требования:

1. Реализовать каркас приложения на актуальной версии React.
2. Использовать TypeScript.
3. Использовать Vite как сборщик.
4. Использовать `react-router` для страниц.
5. Использовать Redux Toolkit и RTK Query, заранее подготовив слой API для будущего Go backend.
6. Пока backend не готов, API может работать через `localStorage`, но компоненты должны использовать RTK Query hooks.
7. Сформировать расширяемую структуру приложения.
8. Вынести базовые UI-компоненты и дизайн-систему в `shared`.
9. Реализовать адаптив под мобильные устройства.
10. Использовать тёмную gold/dark стилистику из дизайн-референса.

## Технологии

Используй:

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-redux": "latest",
    "react-router": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "typescript": "latest",
    "vite": "latest",
    "eslint": "latest",
    "typescript-eslint": "latest",
    "eslint-plugin-react-hooks": "latest",
    "eslint-plugin-react-refresh": "latest",
    "globals": "latest"
  }
}
```

Важно: актуальные версии Vite/React Router требуют современный Node.js. Ориентируйся на Node.js 20+.

## Скрипты package.json

Добавь стандартные скрипты:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

## Структура проекта

Создай структуру, близкую к Feature-Sliced Design:

```txt
src/
  app/
    providers/
      StoreProvider.tsx
    router/
      AppRouter.tsx
    App.tsx
    store.ts

  pages/
    dashboard/
      DashboardPage.tsx
    tasks/
      TasksPage.tsx
    task-detail/
      TaskDetailPage.tsx
    calendar/
      CalendarPage.tsx

  widgets/
    app-layout/
      AppLayout.tsx
    dashboard-summary/
      DashboardSummary.tsx
    task-list/
      TaskList.tsx

  features/
    create-task/
      CreateTaskForm.tsx
    update-task-status/
    toggle-task-star/

  entities/
    task/
      api/
        tasksApi.ts
      model/
        types.ts
        constants.ts
      ui/
        TaskCard.tsx

  shared/
    api/
      baseApi.ts
    config/
      routes.ts
    lib/
      date/
        date.ts
    styles/
      index.css
    ui/
      Card.tsx
      Check.tsx
      EmptyState.tsx
      Icon.tsx
      ProgressBar.tsx
      Ring.tsx

  main.tsx
  vite-env.d.ts
```

### Правила структуры

- `app` — инициализация приложения, store, providers, router.
- `pages` — route-level страницы.
- `widgets` — крупные блоки интерфейса: layout, dashboard, task list.
- `features` — пользовательские сценарии: создание задачи, смена статуса, starred.
- `entities/task` — модель, API и UI сущности задачи.
- `shared` — переиспользуемые UI-компоненты, стили, конфиги, API base layer, утилиты.

## Роутинг

Используй `react-router`.

Маршруты:

```ts
export const routes = {
  dashboard: '/',
  tasks: '/tasks',
  taskDetail: '/tasks/:taskId',
  calendar: '/calendar',
} as const;
```

Страницы:

- `/` — Dashboard / Обзор.
- `/tasks` — список задач.
- `/tasks/:taskId` — детали задачи.
- `/calendar` — календарь.
- `*` — редирект на `/`.

Layout должен быть общим для всех страниц.

## App layout

Реализуй shell приложения:

### Desktop

- Левая боковая панель `sidebar`, ширина примерно `248px`.
- Бренд:

```txt
TK.Tasks
Личный планировщик
```

- Навигация:
  - Обзор;
  - Мои задачи;
  - Календарь.
- Внизу sidebar карточка:

```txt
✨ TK Pro
Безлимит задач, умные напоминания и синхронизация на всех устройствах.
Перейти на Pro
```

- Верхняя панель `topbar`:
  - заголовок текущей страницы;
  - текущая дата на русском;
  - поиск задач;
  - иконка уведомлений;
  - avatar.

### Mobile

- Sidebar скрывается.
- Search переносится под topbar.
- Внизу появляется fixed mobile navigation.
- Контент становится обычным vertical scroll.
- Используй breakpoint примерно `860px`.

## Модель данных

Определи типы:

```ts
export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'home';
export type TaskPriority = 'high' | 'med' | 'low';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  notes: string;
  done: boolean;
  starred: boolean;
  subtasks: Subtask[];
};

export type CreateTaskDto = {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
};

export type TaskFilters = {
  filter?: 'today' | 'upcoming' | 'starred' | 'all' | 'done';
  category?: TaskCategory | 'all';
  query?: string;
  sort?: 'time' | 'priority';
};
```

Категории:

```ts
export const taskCategories = {
  work: { label: 'Работа', color: '#e9c486', icon: 'briefcase' },
  personal: { label: 'Личное', color: '#b69bf0', icon: 'user' },
  health: { label: 'Здоровье', color: '#74d39a', icon: 'heart' },
  learning: { label: 'Обучение', color: '#7bb0f1', icon: 'book' },
  home: { label: 'Дом', color: '#ef9f70', icon: 'sun' },
};
```

Приоритеты:

```ts
export const taskPriorities = {
  high: { label: 'Высокий', color: 'var(--red)' },
  med: { label: 'Средний', color: 'var(--gold)' },
  low: { label: 'Низкий', color: 'var(--green)' },
};
```

## Seed data

Добавь несколько seed-задач, чтобы UI сразу выглядел наполненным.

Примеры задач:

- `Завершить редизайн дашборда`
- `Утренняя пробежка 5 км`
- `Прочитать главу «Atomic Habits»`
- `Созвон с ментором по карьере`

Задачи должны иметь разные категории, приоритеты, статусы, starred и subtasks.

## Date helpers

Создай утилиты:

```ts
export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatDateLabel = (value: string) => {
  if (value === todayISO()) return 'Сегодня';
  if (value === addDays(1)) return 'Завтра';
  if (value === addDays(-1)) return 'Вчера';

  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};
```

## RTK Query

Создай `baseApi`:

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  }),
  tagTypes: ['Task'],
  endpoints: () => ({}),
});
```

Создай store:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../shared/api/baseApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Временный tasksApi

Пока backend не готов, реализуй `tasksApi` через `queryFn` и `localStorage`.

Нужно предоставить hooks:

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

Поведение:

- `getTasks(filters)` возвращает отфильтрованный и отсортированный список.
- `getTaskById(id)` возвращает одну задачу.
- `createTask(dto)` создаёт задачу на сегодня с текущим временем.
- `toggleTaskDone(id)` меняет `done`.
- `toggleTaskStar(id)` меняет `starred`.
- `setTaskPriority({ id, priority })` меняет priority.
- `addSubtask({ taskId, title })` добавляет подзадачу.
- `deleteTask(id)` удаляет задачу.

Важно: компоненты должны использовать только RTK Query hooks, не обращаться к `localStorage` напрямую.

## Shared UI components

### Icon

Создай компонент `Icon`, который рисует inline SVG line-icons.

Минимальный набор иконок:

- `grid`
- `list`
- `check`
- `plus`
- `search`
- `bell`
- `calendar`
- `clock`
- `flag`
- `trash`
- `star`
- `target`
- `trend`
- `inbox`
- `user`
- `briefcase`
- `heart`
- `book`
- `sun`
- `chevRight`
- `chevLeft`
- `fire`

Иконки должны быть `stroke="currentColor"`, `fill="none"`, `strokeWidth="1.9"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.

### Card

Простой wrapper:

```tsx
<div className={`card ${className}`}>{children}</div>
```

### Check

Круглая кнопка статуса:

- выключена: border `var(--text-4)`, иконка прозрачная;
- включена: background `var(--green)`, border `var(--green)`, check тёмный.

Важно: внутри ссылок `Check` должен делать:

```ts
preventDefault();
stopPropagation();
```

### ProgressBar

Горизонтальный прогресс:

- track `var(--surface-3)`;
- fill gradient `var(--gold-2)` → `var(--gold-deep)`.

### Ring

SVG-кольцо прогресса:

- круговой progress ring;
- track `var(--surface-3)`;
- active stroke gold gradient;
- поворот `rotate(-90deg)`;
- плавная анимация `stroke-dashoffset`.

### EmptyState

Пустое состояние:

- иконка inbox;
- title;
- description.

## Pages and widgets

### DashboardPage / DashboardSummary

Dashboard должен включать:

1. Row статистики:
   - активных задач;
   - выполнено всего;
   - серия без пропусков.
2. Карточку продуктивности:
   - можно сделать fake chart вертикальными gold bars.
3. Блок `На сегодня`:
   - до 4 ближайших невыполненных задач на сегодня.
4. Карточку `Прогресс дня`:
   - Ring;
   - процент;
   - `N из M задач`;
   - общий прогресс через ProgressBar.

### TasksPage / TaskList

Страница задач должна включать:

1. `CreateTaskForm`.
2. Фильтры:
   - Сегодня;
   - Предстоит;
   - Важное;
   - Все;
   - Готово.
3. Фильтр по категориям.
4. Sort select:
   - по времени;
   - по приоритету.
5. Список `TaskCard`.
6. EmptyState при пустом списке.
7. Поиск берётся из `AppLayout` через `Outlet context`.

### CreateTaskForm

Поля:

- title input;
- category select;
- priority select;
- submit button.

После создания очищать input.

### TaskCard

Карточка задачи должна быть ссылкой на `/tasks/:id`.

Показывать:

- Check;
- title;
- category dot + label;
- time;
- priority badge;
- subtasks progress `done/total`, если есть subtasks;
- star button;
- delete button;
- chevron right.

Если задача выполнена:

- title зачёркнут;
- muted color.

### TaskDetailPage

Страница деталей должна показывать:

- back button `К списку задач`;
- title;
- Check;
- star button;
- category;
- date label;
- time;
- priority;
- notes;
- subtasks;
- progress by subtasks;
- add subtask input;
- side panel progress;
- side panel priority options;
- side panel details;
- delete task button.

Если задача не найдена — EmptyState.

### CalendarPage

Календарь должен показывать:

- текущий месяц и год;
- сетку 7 колонок;
- дни недели `Пн Вт Ср Чт Пт Сб Вс`;
- ячейки дней;
- сегодняшний день выделен gold-soft;
- для задач в дне — маленькие dots цветом категории;
- если в дне есть задачи, ячейка может быть ссылкой на первую задачу дня.

## Дизайн и стилистика

Нужно воспроизвести dark/gold дизайн из референса.

### Design tokens

В `shared/styles/index.css` задай CSS variables:

```css
:root {
  --bg: #0a0b0f;
  --surface: #14161d;
  --surface-2: #191c24;
  --surface-3: #1f232c;
  --hover: #222631;
  --line: rgba(255, 255, 255, 0.065);
  --line-2: rgba(255, 255, 255, 0.1);

  --text: #f3f4f7;
  --text-2: #aeb3bf;
  --text-3: #6b7180;
  --text-4: #474c58;

  --gold: #e9c486;
  --gold-2: #f0d39e;
  --gold-deep: #d4a85f;
  --gold-soft: rgba(233, 196, 134, 0.13);
  --gold-line: rgba(233, 196, 134, 0.3);

  --red: #ef7070;
  --red-soft: rgba(239, 112, 112, 0.14);
  --green: #74d39a;
  --green-soft: rgba(116, 211, 154, 0.14);
  --violet: #b69bf0;
  --violet-soft: rgba(182, 155, 240, 0.14);

  --r: 16px;
  --r-lg: 22px;
  --shadow-card: 0 1px 0 rgba(255,255,255,.03) inset,
                 0 14px 40px -28px rgba(0,0,0,.85);

  --sans: "Plus Jakarta Sans", system-ui, sans-serif;
  --display: "Sora", var(--sans);
}
```

### Fonts

В `index.html` подключи:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

Использование:

- основной текст: `Plus Jakarta Sans`;
- заголовки, brand, большие числа: `Sora`.

### Visual language

Общий стиль:

- тёмный фон `--bg`;
- фон приложения с subtle radial gradients;
- карточки `--surface`;
- hover `--surface-2`;
- borders через `--line`;
- основной accent — warm gold;
- статусы:
  - green для done;
  - red для dangerous/delete/high;
  - violet для streak/secondary metric;
- border radius чаще `16px`, крупные карточки `22px`;
- мягкие тени через `--shadow-card`.

### App background

Для shell:

```css
.app-shell {
  background:
    radial-gradient(120% 90% at 12% 0%, #0e1118 0%, transparent 55%),
    radial-gradient(120% 90% at 100% 100%, #0d1016 0%, transparent 50%),
    var(--bg);
}
```

### Cards

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
}
```

### Buttons and chips

Chips:

- surface background;
- line border;
- text-2 color;
- active: `gold-soft`, `gold-line`, `gold-2`.

Primary button:

```css
background: linear-gradient(150deg, var(--gold-2), var(--gold-deep));
color: #1a1407;
font-weight: 800;
```

Danger button:

```css
background: var(--red-soft);
color: var(--red);
```

### Task card

Карточка задачи:

- flex layout;
- padding около `17px 20px`;
- background `--surface`;
- border `--line`;
- hover: `--surface-2`, border `--line-2`, лёгкий `translateX(2px)`;
- done title: `--text-4`, line-through.

### Mobile adaptation

Используй breakpoints:

```css
@media (max-width: 980px) {
  .dashboard-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .sidebar {
    display: none;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 14px;
  }
}

@media (max-width: 560px) {
  /* tighten cards, charts, calendar cells */
}
```

Mobile bottom nav style:

```css
.mobile-nav {
  height: 58px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(20, 22, 29, .92);
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0,0,0,.45);
}
```

## index.html

Создай:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0b0f" />
    <title>TK.Tasks — Личный планировщик</title>
    <!-- fonts here -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Acceptance criteria

После генерации должно быть:

1. Приложение запускается через:

```bash
npm install
npm run dev
```

2. TypeScript проходит:

```bash
npx tsc -b
```

3. Есть рабочие страницы:

- `/`
- `/tasks`
- `/tasks/:taskId`
- `/calendar`

4. UI визуально похож на dark/gold дизайн-референс.
5. Desktop layout имеет sidebar + topbar.
6. Mobile layout имеет bottom navigation.
7. Все операции с задачами идут через RTK Query hooks.
8. Временное хранение через `localStorage` изолировано внутри `entities/task/api/tasksApi.ts`.
9. В будущем можно заменить `queryFn` на HTTP-запросы к backend без переписывания UI-компонентов.

## Следующий этап после boilerplate

Когда появится backend, нужно:

1. В `tasksApi.ts` заменить localStorage `queryFn` на HTTP endpoints.
2. Согласовать DTO с Go API.
3. Добавить обработку ошибок и loading states.
4. Возможно добавить optimistic updates для toggle/done/starred.
5. Добавить полноценную форму редактирования задачи.
6. Добавить удаление/переключение подзадач через API.
