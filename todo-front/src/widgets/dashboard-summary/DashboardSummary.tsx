import { Link } from 'react-router';
import { useGetTasksQuery, useToggleTaskDoneMutation } from '../../entities/task/api/tasksApi';
import { taskCategories, taskPriorities } from '../../entities/task/model/constants';
import { todayISO } from '../../shared/lib/date/date';
import { Card } from '../../shared/ui/Card';
import { Check } from '../../shared/ui/Check';
import { Icon } from '../../shared/ui/Icon';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { Ring } from '../../shared/ui/Ring';

export const DashboardSummary = () => {
  const { data: tasks = [] } = useGetTasksQuery({ filter: 'all' });
  const [toggleDone] = useToggleTaskDoneMutation();
  const done = tasks.filter((task) => task.done).length;
  const active = tasks.length - done;
  const todayTasks = tasks.filter((task) => task.date === todayISO());
  const todayDone = todayTasks.filter((task) => task.done).length;
  const todayProgress = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0;
  const totalProgress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const nextToday = todayTasks.filter((task) => !task.done).slice(0, 4);

  return (
    <section className="page fade">
      <div className="stat-row">
        <Card className="stat"><div className="stat__icon gold"><Icon name="target" /></div><div className="stat__num">{active}</div><div className="stat__label">Активных задач</div></Card>
        <Card className="stat"><div className="stat__icon green"><Icon name="check" /></div><div className="stat__num">{done}</div><div className="stat__label">Выполнено всего</div></Card>
        <Card className="stat"><div className="stat__icon violet"><Icon name="fire" /></div><div className="stat__num">12 <span>дн.</span></div><div className="stat__label">Серия без пропусков</div></Card>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Card className="chart-card">
            <div className="section-head"><h2>Продуктивность</h2><span className="pill"><Icon name="calendar" />Последние 7 дней</span></div>
            <div className="fake-chart"><span style={{ height: '42%' }} /><span style={{ height: '58%' }} /><span style={{ height: '48%' }} /><span style={{ height: '72%' }} /><span style={{ height: '100%' }} /><span style={{ height: '62%' }} /><span style={{ height: '80%' }} /></div>
          </Card>
          <div className="section-head section-head--offset"><h2>На сегодня</h2><Link to="/tasks" className="see-link">Все задачи <Icon name="chevRight" /></Link></div>
          <div className="mini-list">
            {nextToday.map((task) => {
              const category = taskCategories[task.category];
              return (
                <Link to={`/tasks/${task.id}`} key={task.id} className="mini-task">
                  <Check checked={task.done} onClick={() => toggleDone(task.id)} />
                  <div><strong>{task.title}</strong><span><i style={{ background: category.color }} />{category.label}</span></div>
                  <time>{task.time}<small>{taskPriorities[task.priority].label}</small></time>
                </Link>
              );
            })}
          </div>
        </div>
        <Card className="ring-card">
          <h3>Прогресс дня</h3>
          <div className="ring-wrap"><Ring value={todayProgress} /><div className="ring-center"><strong>{todayProgress}<span>%</span></strong><small>{todayDone} из {todayTasks.length} задач</small></div></div>
          <div className="progress-line"><span>Общий прогресс</span><b>{totalProgress}%</b></div>
          <ProgressBar value={totalProgress} />
        </Card>
      </div>
    </section>
  );
};
