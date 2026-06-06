import type { Task, TaskCategory, TaskPriority } from './types';
import { addDays, todayISO } from '../../../shared/lib/date/date';

export const taskCategories: Record<TaskCategory, { label: string; color: string; icon: string }> = {
  work: { label: 'Работа', color: '#e9c486', icon: 'briefcase' },
  personal: { label: 'Личное', color: '#b69bf0', icon: 'user' },
  health: { label: 'Здоровье', color: '#74d39a', icon: 'heart' },
  learning: { label: 'Обучение', color: '#7bb0f1', icon: 'book' },
  home: { label: 'Дом', color: '#ef9f70', icon: 'sun' },
};

export const taskPriorities: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: 'Высокий', color: 'var(--red)' },
  med: { label: 'Средний', color: 'var(--gold)' },
  low: { label: 'Низкий', color: 'var(--green)' },
};

export const seedTasks: Task[] = [
  {
    id: 't1',
    title: 'Завершить редизайн дашборда',
    category: 'work',
    priority: 'high',
    date: todayISO(),
    time: '10:00',
    notes: 'Финализировать тёмную тему, прогресс-кольца и недельный график. Проверить адаптив на мобильных.',
    done: false,
    starred: true,
    subtasks: [
      { id: 's1', title: 'Собрать палитру токенов', done: true },
      { id: 's2', title: 'Свёрстать карточки статистики', done: true },
      { id: 's3', title: 'Анимация прогресс-кольца', done: false },
    ],
  },
  {
    id: 't2',
    title: 'Утренняя пробежка 5 км',
    category: 'health',
    priority: 'med',
    date: todayISO(),
    time: '07:00',
    notes: 'Парк, лёгкий темп. Размяться перед стартом.',
    done: true,
    starred: false,
    subtasks: [{ id: 's4', title: 'Разминка 10 мин', done: true }],
  },
  {
    id: 't3',
    title: 'Прочитать главу «Atomic Habits»',
    category: 'learning',
    priority: 'low',
    date: todayISO(),
    time: '21:00',
    notes: 'Глава про окружение и привычки. Сделать заметки.',
    done: false,
    starred: false,
    subtasks: [],
  },
  {
    id: 't4',
    title: 'Созвон с ментором по карьере',
    category: 'work',
    priority: 'med',
    date: addDays(1),
    time: '15:30',
    notes: 'Обсудить план развития на квартал и обратную связь.',
    done: false,
    starred: true,
    subtasks: [],
  },
];
