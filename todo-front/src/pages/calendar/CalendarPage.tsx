import { Link } from 'react-router';
import { useGetTasksQuery } from '../../entities/task/api/tasksApi';
import { taskCategories } from '../../entities/task/model/constants';
import { todayISO } from '../../shared/lib/date/date';
import { Card } from '../../shared/ui/Card';

export const CalendarPage = () => {
  const { data: tasks = [] } = useGetTasksQuery({ filter: 'all' });
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay - 1).fill(null), ...Array.from({ length: daysCount }, (_, index) => index + 1)];
  const toISO = (day: number) => new Date(year, month, day + 1).toISOString().slice(0, 10);

  return (
    <section className="page fade">
      <Card className="calendar-card">
        <div className="section-head"><h2>{now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h2></div>
        <div className="calendar-grid calendar-grid--head">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((day, index) => {
            if (!day) return <div key={index} />;
            const date = toISO(day);
            const dayTasks = tasks.filter((task) => task.date === date);
            const content = <><b>{day}</b><span>{dayTasks.slice(0, 3).map((task) => <i key={task.id} style={{ background: task.done ? 'var(--green)' : taskCategories[task.category].color }} />)}</span></>;
            return dayTasks[0] ? <Link key={index} className={`calendar-cell ${date === todayISO() ? 'today' : ''}`} to={`/tasks/${dayTasks[0].id}`}>{content}</Link> : <div key={index} className={`calendar-cell ${date === todayISO() ? 'today' : ''}`}>{content}</div>;
          })}
        </div>
      </Card>
    </section>
  );
};
