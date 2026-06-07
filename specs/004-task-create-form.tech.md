# 004. Форма создания задачи — техническая спека

## 1. Цель реализации

Обновить frontend UI формы создания задачи и связанных select-контролов, чтобы они соответствовали дизайн-референсу.

Требуется привести к референсу:

- кнопку `Добавить`;
- select категории в форме создания;
- select приоритета в форме создания;
- select сортировки в строке фильтров.

Backend менять не требуется.

## 2. Архитектурные границы

Изменения относятся к frontend-приложению `todo-front`.

Основные файлы:

```txt
todo-front/src/shared/ui/DropdownSelect.tsx
todo-front/src/features/create-task/CreateTaskForm.tsx
todo-front/src/widgets/task-list/TaskList.tsx
todo-front/src/shared/styles/index.css
```

## 3. Текущее состояние

### 3.1. Форма создания

Форма реализована в:

```txt
todo-front/src/features/create-task/CreateTaskForm.tsx
```

Текущая структура:

- `.add-bar` — контейнер формы;
- `.add-bar__plus` — иконка слева;
- `input` — название задачи;
- `select` — категория;
- `select` — приоритет;
- `.add-bar__submit` — кнопка добавления.

### 3.2. Сортировка

Select сортировки расположен в:

```txt
todo-front/src/widgets/task-list/TaskList.tsx
```

Текущий select имеет классы:

```txt
chip filters__sort
```

## 4. Design mapping

### 4.1. Reference classes

В референсе используются следующие стили:

```css
.add-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 8px 8px 8px 20px;
  margin-bottom: 20px;
  transition: 0.16s;
}

.add-bar:focus-within {
  border-color: var(--gold-line);
}

.add-bar .plus {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px dashed var(--text-4);
  display: grid;
  place-items: center;
  color: var(--text-3);
  flex: none;
}

.add-bar .submit {
  padding: 0 22px;
  height: 44px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  background: linear-gradient(150deg, var(--gold-2), var(--gold-deep));
  color: #1a1407;
  display: flex;
  align-items: center;
  gap: 8px;
}
```

В текущем приложении class names отличаются, поэтому нужно адаптировать стили под существующие классы или переименовать элементы.

Рекомендуется использовать существующие классы:

```txt
.add-bar__plus
.add-bar__submit
```

и привести их к визуальному виду `.plus` / `.submit` из референса.

## 5. Implementation plan

### 5.1. `CreateTaskForm.tsx`

Рекомендуемые изменения:

1. Добавить className для select-контролов формы:

```tsx
<select className="control-select" ...>
```

или более специфично:

```tsx
<select className="add-bar__select" ...>
```

2. Оставить текущую бизнес-логику без изменений:

- `title.trim()` validation;
- submit по Enter;
- `useCreateTaskMutation`;
- disabled state для кнопки;
- очистка title после успешного создания.

3. При необходимости отформатировать JSX для читаемости.

### 5.2. `TaskList.tsx`

Select сортировки должен получить общий стиль select-контрола.

Возможный вариант:

```tsx
<select className="control-select filters__sort" ...>
```

Не использовать одновременно `.chip` для select, если это мешает точному соответствию референсу.

### 5.3. `index.css`

Добавить/обновить стили:

```css
.add-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 8px 8px 8px 20px;
  margin-bottom: 20px;
  transition: 0.16s;
}

.add-bar:focus-within {
  border-color: var(--gold-line);
}

.add-bar__plus {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px dashed var(--text-4);
  display: grid;
  place-items: center;
  color: var(--text-3);
  flex: none;
}

.add-bar__plus svg {
  width: 14px;
  height: 14px;
}

.add-bar input {
  flex: 1;
  min-width: 160px;
  height: 44px;
  background: none;
  font-size: 15px;
}

.add-bar input::placeholder {
  color: var(--text-3);
}

.add-bar__submit {
  height: 44px;
  padding: 0 22px;
  border-radius: 14px;
  background: linear-gradient(150deg, var(--gold-2), var(--gold-deep));
  color: #1a1407;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-bar__submit svg {
  width: 17px;
  height: 17px;
}
```

### 5.4. Shared dropdown component

Нативные select-элементы не позволяют точно повторить референсный dropdown во всех браузерах, поэтому для этой задачи используется переиспользуемый shared-компонент:

```txt
todo-front/src/shared/ui/DropdownSelect.tsx
```

Компонент должен поддерживать:

- generic string value;
- список options;
- label;
- optional icon для выбранного значения и пунктов меню;
- optional prefix icon для случаев вроде сортировки;
- выравнивание меню слева/справа;
- закрытие по клику вне компонента;
- закрытие по Escape;
- базовые ARIA-атрибуты `aria-haspopup`, `aria-expanded`, `role="listbox"`, `role="option"`.

### 5.5. Dropdown styling

Стили компонента должны повторять референсные `chip`, `pop`, `pop-item`.

Добавить стили:

```css
.dropdown-select {
  position: relative;
  flex: none;
}

.dropdown-select__button {
  height: 38px;
  padding: 8px 12px;
  white-space: nowrap;
}

.dropdown-select__menu {
  position: absolute;
  top: calc(100% + 8px);
  z-index: 60;
  min-width: 170px;
  padding: 6px;
  border: 1px solid var(--line-2);
  border-radius: 14px;
  background: var(--surface-2);
  box-shadow: var(--shadow-card);
  animation: pop 0.14s ease both;
}

.dropdown-select__option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 9px;
  color: var(--text-2);
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  transition: 0.12s;
}
```

Стрелка раскрытия отображается через shared `Icon` (`chevDown`) внутри кнопки компонента, а не через CSS background. Это упрощает переиспользование и сохраняет единый стиль иконок.

## 6. Responsive behavior

На мобильных экранах форма уже переносит элементы.

Нужно обновить media rules:

```css
.add-bar__select {
  flex: 1;
}

.add-bar__select .dropdown-select__button {
  width: 100%;
  justify-content: center;
}

.add-bar__submit {
  width: 100%;
  justify-content: center;
}
```

Проверить, что select сортировки на мобильном не получает лишний `margin-left`.

## 7. Validation plan

После реализации выполнить:

```txt
npm --prefix todo-front run build
```

Ручная проверка:

1. Открыть страницу задач.
2. Проверить внешний вид формы создания задачи.
3. Проверить disabled state кнопки `Добавить` при пустом input.
4. Ввести текст и создать задачу кнопкой.
5. Ввести текст и создать задачу клавишей Enter.
6. Проверить select категории.
7. Проверить select приоритета.
8. Проверить select сортировки.
9. Проверить перенос формы на узком экране.

## 8. Acceptance criteria

Реализация принимается, если:

1. Кнопка `Добавить` визуально соответствует референсу.
2. Select категории и приоритета визуально соответствуют форме.
3. Select сортировки визуально соответствует фильтрам.
4. Поведение создания задачи не изменилось.
5. Сортировка продолжает работать.
6. Production build frontend проходит успешно.
