import { useState } from 'react';
import { useDeleteTaskMutation, useGetTasksQuery, useToggleTaskDoneMutation, useToggleTaskStarMutation } from '../../entities/task/api/tasksApi';
import { taskCategories } from '../../entities/task/model/constants';
import type { TaskCategory, TaskFilters } from '../../entities/task/model/types';
import { TaskCard } from '../../entities/task/ui/TaskCard';
import { CreateTaskForm } from '../../features/create-task/CreateTaskForm';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Icon } from '../../shared/ui/Icon';

const filters: Array<{ key: NonNullable<TaskFilters['filter']>; label: string; icon: 'sun' | 'clock' | 'star' | 'list' | 'check' }> = [
  { key: 'today', label: 'Сегодня', icon: 'sun' },
  { key: 'upcoming', label: 'Предстоит', icon: 'clock' },
  { key: 'starred', label: 'Важное', icon: 'star' },
  { key: 'all', label: 'Все', icon: 'list' },
  { key: 'done', label: 'Готово', icon: 'check' },
];

type TaskListProps = {
  query: string;
};

export const TaskList = ({ query }: TaskListProps) => {
  const [filter, setFilter] = useState<NonNullable<TaskFilters['filter']>>('today');
  const [category, setCategory] = useState<TaskCategory | 'all'>('all');
  const [sort, setSort] = useState<NonNullable<TaskFilters['sort']>>('time');
  const { data: tasks = [], isLoading } = useGetTasksQuery({ filter, category, sort, query });
  const [toggleDone] = useToggleTaskDoneMutation();
  const [toggleStar] = useToggleTaskStarMutation();
  const [deleteTask] = useDeleteTaskMutation();

  return (
    <section className="page fade">
      <CreateTaskForm />
      <div className="filters">
        {filters.map((item) => (
          <button key={item.key} className={`chip ${filter === item.key ? 'on' : ''}`} onClick={() => setFilter(item.key)}>
            <Icon name={item.icon} />{item.label}
          </button>
        ))}
        <select className="chip filters__sort" value={sort} onChange={(event) => setSort(event.target.value as NonNullable<TaskFilters['sort']>)}>
          <option value="time">По времени</option>
          <option value="priority">По приоритету</option>
        </select>
      </div>
      <div className="filters filters--compact">
        <button className={`chip ${category === 'all' ? 'on' : ''}`} onClick={() => setCategory('all')}>Все категории</button>
        {Object.entries(taskCategories).map(([key, item]) => (
          <button key={key} className={`chip ${category === key ? 'on' : ''}`} onClick={() => setCategory(key as TaskCategory)}>
            <i className="cat-dot" style={{ background: item.color }} />{item.label}
          </button>
        ))}
      </div>
      {isLoading && <div className="loading">Загружаем задачи…</div>}
      {!isLoading && tasks.length === 0 && <EmptyState title="Здесь пока пусто" description="Добавь первую задачу — она появится в списке." />}
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onToggleDone={toggleDone} onToggleStar={toggleStar} onDelete={deleteTask} />
        ))}
      </div>
    </section>
  );
};
