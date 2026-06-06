import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useAddSubtaskMutation, useDeleteTaskMutation, useGetTaskByIdQuery, useSetTaskPriorityMutation, useToggleTaskDoneMutation, useToggleTaskStarMutation } from '../../entities/task/api/tasksApi';
import { taskCategories, taskPriorities } from '../../entities/task/model/constants';
import type { TaskPriority } from '../../entities/task/model/types';
import { formatDateLabel } from '../../shared/lib/date/date';
import { Card } from '../../shared/ui/Card';
import { Check } from '../../shared/ui/Check';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Icon } from '../../shared/ui/Icon';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { Ring } from '../../shared/ui/Ring';

export const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const { data: task, isLoading } = useGetTaskByIdQuery(taskId ?? '', { skip: !taskId });
  const [toggleDone] = useToggleTaskDoneMutation();
  const [toggleStar] = useToggleTaskStarMutation();
  const [setPriority] = useSetTaskPriorityMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  if (!taskId) return <Navigate to="/tasks" replace />;
  if (isLoading) return <section className="page">Загружаем задачу…</section>;
  if (!task) return <section className="page"><EmptyState title="Задача не найдена" description="Возможно, она была удалена." /></section>;

  const category = taskCategories[task.category];
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.done).length;
  const progress = task.subtasks.length ? Math.round((doneSubtasks / task.subtasks.length) * 100) : task.done ? 100 : 0;

  const submitSubtask = async () => {
    const title = subtaskTitle.trim();
    if (!title) return;
    await addSubtask({ taskId: task.id, title });
    setSubtaskTitle('');
  };

  const remove = async () => {
    await deleteTask(task.id);
    navigate('/tasks');
  };

  return (
    <section className="page fade">
      <Link to="/tasks" className="back-btn"><Icon name="chevLeft" />К списку задач</Link>
      <div className="detail-grid">
        <Card className="detail-main">
          <div className="detail-title"><Check checked={task.done} onClick={() => toggleDone(task.id)} size={28} /><h1 className={task.done ? 'done' : ''}>{task.title}</h1><button className={`star-btn ${task.starred ? 'on' : ''}`} onClick={() => toggleStar(task.id)}><Icon name="star" /></button></div>
          <div className="detail-meta">
            <span><Icon name={category.icon as never} /><small>Категория</small><b style={{ color: category.color }}>{category.label}</b></span>
            <span><Icon name="calendar" /><small>Дата</small><b>{formatDateLabel(task.date)}</b></span>
            <span><Icon name="clock" /><small>Время</small><b>{task.time}</b></span>
            <span><Icon name="flag" /><small>Приоритет</small><b style={{ color: taskPriorities[task.priority].color }}>{taskPriorities[task.priority].label}</b></span>
          </div>
          <h3>Заметка</h3><p className="note">{task.notes || 'Без описания.'}</p>
          <h3>Подзадачи <small>{doneSubtasks}/{task.subtasks.length}</small></h3>
          {task.subtasks.length > 0 && <ProgressBar value={progress} />}
          <div className="subtasks">{task.subtasks.map((subtask) => <div key={subtask.id} className={`subtask ${subtask.done ? 'done' : ''}`}><Check checked={subtask.done} size={21} /><span>{subtask.title}</span></div>)}</div>
          <div className="add-subtask"><Icon name="plus" /><input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitSubtask()} placeholder="Добавить подзадачу…" /></div>
        </Card>
        <aside className="detail-side">
          <Card className="side-panel"><h4>Прогресс</h4><div className="progress-big"><Ring value={progress} size={64} stroke={8} /><strong>{progress}%</strong></div></Card>
          <Card className="side-panel"><h4>Приоритет</h4><div className="priority-options">{Object.entries(taskPriorities).map(([key, item]) => <button key={key} className={task.priority === key ? 'on' : ''} onClick={() => setPriority({ id: task.id, priority: key as TaskPriority })}>{item.label}</button>)}</div></Card>
          <Card className="side-panel"><h4>Детали</h4><div className="kv"><span>Срок</span><b>{formatDateLabel(task.date)}, {task.time}</b></div><div className="kv"><span>Статус</span><b>{task.done ? 'Готово' : 'В работе'}</b></div></Card>
          <button className="danger-btn" onClick={remove}><Icon name="trash" />Удалить задачу</button>
        </aside>
      </div>
    </section>
  );
};
