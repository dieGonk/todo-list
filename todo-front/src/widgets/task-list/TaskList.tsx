import { useSearchParams } from "react-router";
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useToggleTaskDoneMutation,
  useToggleTaskStarMutation,
} from "../../entities/task/api/tasksApi";
import { taskCategories } from "../../entities/task/model/constants";
import type {
  TaskCategory,
  TaskFilters,
} from "../../entities/task/model/types";
import { TaskCard } from "../../entities/task/ui/TaskCard";
import { CreateTaskForm } from "../../features/create-task/CreateTaskForm";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Icon } from "../../shared/ui/Icon";

const filters: Array<{
  key: NonNullable<TaskFilters["filter"]>;
  label: string;
  icon: "sun" | "clock" | "star" | "list" | "check";
}> = [
  { key: "today", label: "Сегодня", icon: "sun" },
  { key: "upcoming", label: "Предстоит", icon: "clock" },
  { key: "starred", label: "Важное", icon: "star" },
  { key: "all", label: "Все", icon: "list" },
  { key: "done", label: "Готово", icon: "check" },
];

const filterKeys = filters.map((item) => item.key);
const categoryKeys = Object.keys(taskCategories) as TaskCategory[];
const sortKeys: Array<NonNullable<TaskFilters["sort"]>> = ["time", "priority"];

const parseFilter = (
  value: string | null,
): NonNullable<TaskFilters["filter"]> =>
  filterKeys.includes(value as NonNullable<TaskFilters["filter"]>)
    ? (value as NonNullable<TaskFilters["filter"]>)
    : "today";

const parseCategory = (value: string | null): TaskCategory | "all" => {
  if (value === "all") return "all";
  return categoryKeys.includes(value as TaskCategory)
    ? (value as TaskCategory)
    : "all";
};

const parseSort = (value: string | null): NonNullable<TaskFilters["sort"]> =>
  sortKeys.includes(value as NonNullable<TaskFilters["sort"]>)
    ? (value as NonNullable<TaskFilters["sort"]>)
    : "time";

type TaskListProps = {
  query: string;
};

export const TaskList = ({ query }: TaskListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseFilter(searchParams.get("filter"));
  const category = parseCategory(searchParams.get("category"));
  const sort = parseSort(searchParams.get("sort"));
  const { data: tasks = [], isLoading } = useGetTasksQuery({
    filter,
    category,
    sort,
    query,
  });

  const updateParam = (key: keyof TaskFilters, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next);
  };
  const [toggleDone] = useToggleTaskDoneMutation();
  const [toggleStar] = useToggleTaskStarMutation();
  const [deleteTask] = useDeleteTaskMutation();

  return (
    <section className="page fade">
      <CreateTaskForm />
      <div className="filters">
        {filters.map((item) => (
          <button
            key={item.key}
            className={`chip ${filter === item.key ? "on" : ""}`}
            onClick={() => updateParam("filter", item.key)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
        <select
          className="chip filters__sort"
          value={sort}
          onChange={(event) => updateParam("sort", event.target.value)}
        >
          <option value="time">По времени</option>
          <option value="priority">По приоритету</option>
        </select>
      </div>
      <div className="filters filters--compact">
        <button
          className={`chip ${category === "all" ? "on" : ""}`}
          onClick={() => updateParam("category", "all")}
        >
          Все категории
        </button>
        {Object.entries(taskCategories).map(([key, item]) => (
          <button
            key={key}
            className={`chip ${category === key ? "on" : ""}`}
            onClick={() => updateParam("category", key)}
          >
            <i className="cat-dot" style={{ background: item.color }} />
            {item.label}
          </button>
        ))}
      </div>
      {isLoading && <div className="loading">Загружаем задачи…</div>}
      {!isLoading && tasks.length === 0 && (
        <EmptyState
          title="Здесь пока пусто"
          description="Добавь первую задачу — она появится в списке."
        />
      )}
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleDone={toggleDone}
            onToggleStar={toggleStar}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </section>
  );
};
