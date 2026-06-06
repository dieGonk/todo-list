import { Link } from 'react-router';
import { Check } from '../../../shared/ui/Check';
import { Icon } from '../../../shared/ui/Icon';
import { taskCategories, taskPriorities } from '../model/constants';
import type { Task } from '../model/types';

type TaskCardProps = {
  task: Task;
  onToggleDone: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
};

export const TaskCard = ({ task, onToggleDone, onToggleStar, onDelete }: TaskCardProps) => {
  const category = taskCategories[task.category];
  const priority = taskPriorities[task.priority];
  const doneCount = task.subtasks.filter((subtask) => subtask.done).length;

  return (
    <Link to={`/tasks/${task.id}`} className={`task-card ${task.done ? 'done' : ''}`}>
      <Check checked={task.done} onClick={() => onToggleDone(task.id)} />
      <div className="task-card__body">
        <div className="task-card__title">{task.title}</div>
        <div className="task-card__meta">
          <span><i style={{ background: category.color }} />{category.label}</span>
          <span><Icon name="clock" />{task.time}</span>
          <span className="badge" style={{ color: priority.color }}>{priority.label}</span>
          {task.subtasks.length > 0 && <span><Icon name="list" />{doneCount}/{task.subtasks.length}</span>}
        </div>
      </div>
      <div className="task-card__actions">
        <button className={`task-card__star ${task.starred ? 'on' : ''}`} onClick={(event) => { event.preventDefault(); onToggleStar(task.id); }} aria-label="Важное">
          <Icon name="star" />
        </button>
        <button className="task-card__delete" onClick={(event) => { event.preventDefault(); onDelete(task.id); }} aria-label="Удалить">
          <Icon name="trash" />
        </button>
        <Icon name="chevRight" className="task-card__chevron" />
      </div>
    </Link>
  );
};
