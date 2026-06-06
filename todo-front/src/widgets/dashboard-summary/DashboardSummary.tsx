import { Link } from "react-router";
import { useGetProductivityQuery } from "../../entities/stats/api/statsApi";
import {
  useGetTasksQuery,
  useToggleTaskDoneMutation,
} from "../../entities/task/api/tasksApi";
import {
  taskCategories,
  taskPriorities,
} from "../../entities/task/model/constants";
import { todayISO } from "../../shared/lib/date/date";
import { Card } from "../../shared/ui/Card";
import { Check } from "../../shared/ui/Check";
import { Icon } from "../../shared/ui/Icon";
import { ProgressBar } from "../../shared/ui/ProgressBar";
import { Ring } from "../../shared/ui/Ring";
import { ProductivityChart } from "../productivity-chart/ProductivityChart";

export const DashboardSummary = () => {
  const { data: tasks = [] } = useGetTasksQuery({ filter: "all" });
  const {
    data: productivity,
    isLoading: isProductivityLoading,
    isError: isProductivityError,
  } = useGetProductivityQuery();
  const [toggleDone] = useToggleTaskDoneMutation();
  const done = tasks.filter((task) => task.done).length;
  const active = tasks.length - done;
  const todayTasks = tasks.filter((task) => task.date === todayISO());
  const todayDone = todayTasks.filter((task) => task.done).length;
  const todayProgress = todayTasks.length
    ? Math.round((todayDone / todayTasks.length) * 100)
    : 0;
  const totalProgress = tasks.length
    ? Math.round((done / tasks.length) * 100)
    : 0;
  const nextToday = todayTasks.filter((task) => !task.done).slice(0, 4);
  const summary = productivity?.summary ?? {
    inProgress: active,
    completed: done,
    upcoming: tasks.filter((task) => !task.done && task.date > todayISO())
      .length,
  };

  return (
    <section className="page fade">
      <div className="stat-row">
        <Card className="stat">
          <div className="stat__icon gold">
            <Icon name="target" />
          </div>
          <div className="stat__num">{active}</div>
          <div className="stat__label">Активных задач</div>
        </Card>
        <Card className="stat">
          <div className="stat__icon green">
            <Icon name="check" />
          </div>
          <div className="stat__num">{done}</div>
          <div className="stat__label">Выполнено всего</div>
        </Card>
        <Card className="stat">
          <div className="stat__icon violet">
            <Icon name="fire" />
          </div>
          <div className="stat__num">
            12 <span>дн.</span>
          </div>
          <div className="stat__label">Серия без пропусков</div>
        </Card>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Card className="chart-card">
            <div className="section-head">
              <h2>Продуктивность</h2>
              <span className="pill">
                <Icon name="calendar" />
                Последние 7 дней
              </span>
            </div>
            <div className="legend">
              <div className="legend__item">
                <div className="legend__icon gold">
                  <Icon name="target" />
                </div>
                <div>
                  <div className="legend__value">{summary.inProgress}</div>
                  <div className="legend__text">В работе</div>
                </div>
              </div>
              <div className="legend__item">
                <div className="legend__icon green">
                  <Icon name="check" />
                </div>
                <div>
                  <div className="legend__value">{summary.completed}</div>
                  <div className="legend__text">Завершено</div>
                </div>
              </div>
              <div className="legend__item">
                <div className="legend__icon violet">
                  <Icon name="clock" />
                </div>
                <div>
                  <div className="legend__value">{summary.upcoming}</div>
                  <div className="legend__text">Предстоит</div>
                </div>
              </div>
            </div>
            {isProductivityError ? (
              <div className="chart-state">Не удалось загрузить статистику</div>
            ) : isProductivityLoading ? (
              <div className="chart-state">Загружаем статистику…</div>
            ) : (
              <ProductivityChart points={productivity?.points ?? []} />
            )}
          </Card>
          <div className="section-head section-head--offset">
            <h2>На сегодня</h2>
            <Link to="/tasks" className="see-link">
              Все задачи <Icon name="chevRight" />
            </Link>
          </div>
          <div className="mini-list">
            {nextToday.map((task) => {
              const category = taskCategories[task.category];
              return (
                <Link
                  to={`/tasks/${task.id}`}
                  key={task.id}
                  className="mini-task"
                >
                  <Check
                    checked={task.done}
                    onClick={() => toggleDone(task.id)}
                  />
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      <i style={{ background: category.color }} />
                      {category.label}
                    </span>
                  </div>
                  <time>
                    {task.time}
                    <small>{taskPriorities[task.priority].label}</small>
                  </time>
                </Link>
              );
            })}
          </div>
        </div>
        <Card className="ring-card">
          <h4 className="ring-card__title">Прогресс дня</h4>
          <div className="ring-wrap">
            <Ring value={todayProgress} />
            <div className="ring-center">
              <div className="ring-center__pct">
                {todayProgress}
                <span>%</span>
              </div>
              <div className="ring-center__caption">
                {todayDone} из {todayTasks.length} задач
              </div>
            </div>
          </div>
          <div className="ring-legend">
            <div className="ring-legend__item">
              <div className="ring-legend__top">
                <i style={{ background: "var(--gold)" }} />
                Выполнено
              </div>
              <div className="ring-legend__value">{todayDone}</div>
            </div>
            <div className="ring-legend__item">
              <div className="ring-legend__top">
                <i style={{ background: "var(--surface-3)" }} />
                Осталось
              </div>
              <div className="ring-legend__value">
                {todayTasks.length - todayDone}
              </div>
            </div>
          </div>
          <div className="progress-total">
            <div className="progress-line">
              <span>Общий прогресс</span>
              <b>{totalProgress}%</b>
            </div>
            <ProgressBar value={totalProgress} />
          </div>
        </Card>
      </div>
    </section>
  );
};
