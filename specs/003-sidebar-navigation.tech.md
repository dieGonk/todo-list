# 003. Левое меню и навигация — техническая спека

## 1. Цель реализации

Обновить sidebar во frontend `TK.Tasks`, чтобы он соответствовал референсу:

- привести стиль активного пункта меню к референсу;
- добавить блок категорий;
- добавить счётчики задач в меню;
- сделать бренд кликабельной ссылкой на главную страницу.

Backend менять не требуется.

## 2. Архитектурные границы

Изменения относятся к frontend-приложению `todo-front`.

Основные зоны изменений:

```txt
todo-front/src/widgets/app-layout/AppLayout.tsx
todo-front/src/shared/styles/index.css
todo-front/src/shared/config/routes.ts       # при необходимости
todo-front/src/pages/tasks/TasksPage.tsx     # при необходимости
todo-front/src/widgets/task-list/TaskList.tsx # при необходимости
todo-front/src/entities/task/model/constants.ts
```

RTK Query API задач уже существует и может использоваться для получения данных счётчиков:

```txt
todo-front/src/entities/task/api/tasksApi.ts
```

## 3. Текущее состояние

### 3.1. Sidebar

Текущий sidebar реализован в:

```txt
todo-front/src/widgets/app-layout/AppLayout.tsx
```

Сейчас в меню есть:

- `Обзор`;
- `Мои задачи`;
- `Календарь`.

Блок `TK Pro` уже удалён.

### 3.2. Категории

Категории уже описаны во frontend:

```ts
export const taskCategories = {
  work: { label: 'Работа', color: '#e9c486', icon: 'briefcase' },
  personal: { label: 'Личное', color: '#b69bf0', icon: 'user' },
  health: { label: 'Здоровье', color: '#74d39a', icon: 'heart' },
  learning: { label: 'Обучение', color: '#7bb0f1', icon: 'book' },
  home: { label: 'Дом', color: '#ef9f70', icon: 'sun' },
};
```

Использовать существующие цвета и названия, не дублировать их вручную.

### 3.3. Фильтры задач

Тип фильтров уже поддерживает:

```ts
type TaskFilters = {
  filter?: 'today' | 'upcoming' | 'starred' | 'all' | 'done';
  category?: TaskCategory | 'all';
  query?: string;
  sort?: 'time' | 'priority';
};
```

`TaskList` сейчас хранит `filter`, `category`, `sort` локально через `useState`.

## 4. UX / routing design

### 4.1. Brand link

Область бренда в sidebar должна стать ссылкой на dashboard:

```txt
/
```

Рекомендуемая реализация:

- заменить wrapper бренда на `NavLink` или `Link` из `react-router`;
- сохранить текущую структуру и стили `.brand`, `.brand__mark`, `.brand__name`, `.brand__sub`;
- не ломать внешний вид бренда;
- добавить hover/focus состояние, если оно уже есть в дизайн-системе или требуется доступность.

### 4.2. Main nav items

Рекомендуемый набор пунктов:

```ts
const navItems = [
  { to: routes.dashboard, label: 'Обзор', icon: 'grid' },
  { to: routes.tasks, label: 'Мои задачи', icon: 'list', count: todayActiveCount },
  { to: routes.calendar, label: 'Календарь', icon: 'calendar' },
  { to: `${routes.tasks}?filter=starred`, label: 'Важное', icon: 'star', count: starredCount },
];
```

Если команда решит не добавлять пункт `Важное` в sidebar, счётчик `starredCount` не нужен в основном меню. Но для соответствия референсу рекомендуется добавить этот пункт.

### 4.3. Category nav items

Блок категорий должен рендериться после основного меню:

```txt
Меню
- Обзор
- Мои задачи
- Календарь
- Важное

Категории
- Работа      N
- Личное      N
- Здоровье    N
- Обучение    N
- Дом         N
```

Для перехода по категории рекомендуется использовать URL query params:

```txt
/tasks?category=work
/tasks?category=personal
/tasks?category=health
/tasks?category=learning
/tasks?category=home
```

Это позволит:

- сохранять выбранную категорию при reload;
- подсвечивать активную категорию по URL;
- не прокидывать состояние категории через layout context;
- сделать sidebar источником навигации, а не внутренним контролом страницы.

## 5. State and data design

### 5.1. Получение задач для счётчиков

В `AppLayout` можно использовать существующий hook:

```ts
const { data: allTasks = [] } = useGetTasksQuery({ filter: 'all' });
```

На основе `allTasks` рассчитать:

```ts
const todayActiveCount = allTasks.filter(
  (task) => task.date === todayISO() && !task.done,
).length;

const starredCount = allTasks.filter((task) => task.starred).length;

const categoryCounts = Object.keys(taskCategories).reduce((acc, category) => {
  acc[category] = allTasks.filter(
    (task) => task.category === category && !task.done,
  ).length;
  return acc;
}, {} as Record<TaskCategory, number>);
```

Можно использовать `useMemo`, если хочется избежать лишних вычислений на каждом render.

### 5.2. Инвалидация кеша

`tasksApi` уже инвалидирует `Task` при создании, выполнении и удалении задач. После этих операций `useGetTasksQuery({ filter: 'all' })` должен перезапрашиваться или обновляться RTK Query cache invalidation.

Если счётчики не обновятся автоматически, проверить:

- совпадают ли `providesTags` для `getTasks`;
- все ли изменяющие мутации инвалидируют `Task`;
- нет ли отдельного кеша, который не получает invalidation.

### 5.3. URL as source of truth для TaskList

Чтобы sidebar мог управлять фильтрами страницы задач, рекомендуется перевести `TaskList` на чтение query params.

Поддерживаемые query params:

```txt
filter=today|upcoming|starred|all|done
category=all|work|personal|health|learning|home
sort=time|priority
```

Правила defaults:

```txt
filter=today
category=all
sort=time
```

Если query param отсутствует или некорректен, использовать default.

Рекомендуемый подход:

- в `TaskList` использовать `useSearchParams`;
- значения `filter`, `category`, `sort` читать из URL;
- при клике по chip обновлять URL params;
- `query` поиска оставить через `Outlet context`, как сейчас, если менять поиск не требуется.

Это позволит категории из sidebar открывать корректный список задач без дополнительного глобального состояния.

## 6. Styling spec

### 6.1. Active nav item

Текущие стили `.nav-item.active` привести к референсу.

Ожидаемые CSS-характеристики:

```css
.nav-item.active {
  background: var(--surface-2);
  color: var(--text);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 22px;
  border-radius: 0 4px 4px 0;
  background: var(--gold);
}

.nav-item.active svg {
  color: var(--gold);
  opacity: 1;
}
```

Учитывать текущий класс `sidebar`, где padding может отличаться от референсного `.side`. Положение `left` должно быть подобрано под текущий отступ sidebar так, чтобы золотой индикатор стоял у левого края панели.

### 6.2. Nav count badge

Добавить стили:

```css
.nav-count {
  margin-left: auto;
  min-width: 24px;
  padding: 1px 9px;
  border-radius: 20px;
  background: var(--surface-3);
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.nav-item.active .nav-count {
  background: var(--gold-soft);
  color: var(--gold);
}
```

### 6.3. Category dot

Можно использовать существующий `.cat-dot`, если он уже соответствует дизайну.

Если нужен wrapper для выравнивания:

```tsx
<span className="nav-category-dot">
  <i className="cat-dot" style={{ background: category.color }} />
</span>
```

CSS:

```css
.nav-category-dot {
  width: 20px;
  display: grid;
  place-items: center;
  flex: none;
}

.nav-category-dot .cat-dot {
  width: 9px;
  height: 9px;
}
```

## 7. Component implementation plan

### 7.1. `AppLayout.tsx`

Изменить imports:

```ts
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useGetTasksQuery } from '../../entities/task/api/tasksApi';
import { taskCategories } from '../../entities/task/model/constants';
import type { TaskCategory } from '../../entities/task/model/types';
import { todayISO } from '../../shared/lib/date/date';
```

Добавить расчёт счётчиков внутри `AppLayout`.

Рендер бренда:

```tsx
<Link to={routes.dashboard} className="brand" aria-label="На главную">
  ...
</Link>
```

Рендер nav item count:

```tsx
{item.count ? <span className="nav-count">{item.count}</span> : null}
```

Рендер категорий:

```tsx
<div className="nav-label">Категории</div>
<nav className="sidebar__nav sidebar__nav--categories">
  {Object.entries(taskCategories).map(([key, category]) => (
    <NavLink
      key={key}
      to={`${routes.tasks}?category=${key}`}
      className={...}
    >
      <span className="nav-category-dot">
        <i className="cat-dot" style={{ background: category.color }} />
      </span>
      {category.label}
      <span className="nav-count">{categoryCounts[key as TaskCategory]}</span>
    </NavLink>
  ))}
</nav>
```

Для active state категорий сравнивать `location.pathname` и `URLSearchParams(location.search)`:

```ts
const activeCategory = new URLSearchParams(location.search).get('category');
```

### 7.2. `TaskList.tsx`

Если реализуется URL-driven фильтрация:

- заменить локальные `useState` для `filter`, `category`, `sort` на `useSearchParams`;
- добавить validators для query params;
- onClick chip должен обновлять search params;
- select sort должен обновлять `sort` param.

Псевдокод:

```ts
const [searchParams, setSearchParams] = useSearchParams();

const filter = parseFilter(searchParams.get('filter')) ?? 'today';
const category = parseCategory(searchParams.get('category')) ?? 'all';
const sort = parseSort(searchParams.get('sort')) ?? 'time';

const updateParam = (key: string, value: string) => {
  const next = new URLSearchParams(searchParams);
  next.set(key, value);
  setSearchParams(next);
};
```

Важно: при клике на `Мои задачи` без query params TaskList должен использовать default `filter=today`.

### 7.3. `routes.ts`

Можно не менять, если query params формируются прямо в `AppLayout`.

Если хочется централизовать URL builders, добавить helpers не в `routes.ts`, а в отдельный util, чтобы не смешивать route constants и query generation.

## 8. Edge cases

1. Если задач нет, счётчики категорий показывают `0` или скрываются — для категорий рекомендуется показывать `0`, как в референсе счётчик всегда присутствует.
2. Если `filter` query param некорректный, использовать `today`.
3. Если `category` query param некорректный, использовать `all`.
4. Если пользователь находится на деталях задачи, пункт `Мои задачи` должен считаться активным, как сейчас ожидаемо для task detail context.
5. Если пользователь находится на `/tasks?category=work`, активной должна быть категория `Работа`; `Мои задачи` может также считаться активным как раздел, но визуально не должно возникать конфликтов двух одинаково сильных active states. Рекомендуется для category links использовать отдельный active condition и оставить `Мои задачи` активным только при отсутствии category param.

## 9. Validation plan

После реализации выполнить:

```txt
npm --prefix todo-front run build
```

Ручная проверка:

1. Открыть dashboard — активен `Обзор`, бренд ведёт на `/`.
2. Открыть `/tasks` — активен `Мои задачи`.
3. Открыть `/calendar` — активен `Календарь`.
4. Открыть `/tasks?filter=starred` — активен `Важное`, если пункт добавлен.
5. Открыть `/tasks?category=work` — активна категория `Работа`, список отфильтрован по работе.
6. Выполнить задачу на сегодня — счётчик `Мои задачи` уменьшается.
7. Выполнить задачу категории — счётчик категории уменьшается.
8. Создать новую задачу — соответствующие счётчики обновляются.
9. Удалить задачу — соответствующие счётчики обновляются.
10. Проверить мобильную навигацию — она не должна визуально измениться или сломаться.

## 10. Acceptance criteria

Реализация принимается, если:

1. Sidebar визуально соответствует референсу по active state.
2. Бренд кликабелен и ведёт на dashboard.
3. Основное меню содержит счётчики там, где они предусмотрены.
4. Добавлен блок `Категории` со всеми категориями и счётчиками.
5. Клик по категории открывает `/tasks` с соответствующим фильтром.
6. `TaskList` корректно читает фильтры из URL query params.
7. Счётчики обновляются после мутаций задач.
8. Production build frontend проходит успешно.
