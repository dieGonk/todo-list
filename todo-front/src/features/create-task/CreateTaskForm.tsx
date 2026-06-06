import { useState } from 'react';
import { useCreateTaskMutation } from '../../entities/task/api/tasksApi';
import { taskCategories, taskPriorities } from '../../entities/task/model/constants';
import type { TaskCategory, TaskPriority } from '../../entities/task/model/types';
import { Icon } from '../../shared/ui/Icon';

export const CreateTaskForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('med');
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const submit = async () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    await createTask({ title: nextTitle, category, priority });
    setTitle('');
  };

  return (
    <div className="add-bar">
      <div className="add-bar__plus"><Icon name="plus" /></div>
      <input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Добавить задачу на сегодня…" />
      <select value={category} onChange={(event) => setCategory(event.target.value as TaskCategory)}>
        {Object.entries(taskCategories).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
      </select>
      <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
        {Object.entries(taskPriorities).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
      </select>
      <button className="add-bar__submit" onClick={submit} disabled={!title.trim() || isLoading}>
        <Icon name="plus" />Добавить
      </button>
    </div>
  );
};
