import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useMemo, useState } from "react";
import { useGetTasksQuery } from "../../entities/task/api/tasksApi";
import { taskCategories } from "../../entities/task/model/constants";
import type { TaskCategory } from "../../entities/task/model/types";
import { routes } from "../../shared/config/routes";
import { todayISO } from "../../shared/lib/date/date";
import { Icon } from "../../shared/ui/Icon";
import type { IconName } from "../../shared/ui/Icon";

export type AppLayoutContext = {
  query: string;
};

const mobileNavItems: Array<{ to: string; label: string; icon: IconName }> = [
  { to: routes.dashboard, label: "Обзор", icon: "grid" },
  { to: routes.tasks, label: "Мои задачи", icon: "list" },
  { to: routes.calendar, label: "Календарь", icon: "calendar" },
];

const getTitle = (pathname: string) => {
  if (pathname === routes.dashboard) return "Привет 👋";
  if (pathname.startsWith("/tasks/") && pathname !== routes.tasks)
    return "Детали задачи";
  if (pathname.startsWith(routes.tasks)) return "Мои задачи";
  if (pathname.startsWith(routes.calendar)) return "Календарь";
  return "TK.Tasks";
};

export const AppLayout = () => {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const { data: allTasks = [] } = useGetTasksQuery({ filter: "all" });
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get("category");
  const activeFilter = searchParams.get("filter");
  const dateLabel = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayActiveCount = allTasks.filter(
    (task) => task.date === todayISO() && !task.done,
  ).length;
  const starredCount = allTasks.filter(
    (task) => task.starred && !task.done,
  ).length;
  const categoryCounts = useMemo(
    () =>
      Object.keys(taskCategories).reduce(
        (acc, category) => {
          acc[category as TaskCategory] = allTasks.filter(
            (task) => task.category === category && !task.done,
          ).length;
          return acc;
        },
        {} as Record<TaskCategory, number>,
      ),
    [allTasks],
  );

  const sidebarNavItems: Array<{
    to: string;
    label: string;
    icon: IconName;
    count?: number;
    active: boolean;
  }> = [
    {
      to: routes.dashboard,
      label: "Обзор",
      icon: "grid",
      active: location.pathname === routes.dashboard,
    },
    {
      to: routes.tasks,
      label: "Мои задачи",
      icon: "list",
      count: todayActiveCount,
      active:
        (location.pathname === routes.tasks &&
          !activeCategory &&
          activeFilter !== "starred") ||
        (location.pathname.startsWith("/tasks/") &&
          location.pathname !== routes.tasks),
    },
    {
      to: routes.calendar,
      label: "Календарь",
      icon: "calendar",
      active: location.pathname.startsWith(routes.calendar),
    },
    {
      to: `${routes.tasks}?filter=starred`,
      label: "Важное",
      icon: "star",
      count: starredCount,
      active:
        location.pathname === routes.tasks &&
        activeFilter === "starred" &&
        !activeCategory,
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to={routes.dashboard} className="brand" aria-label="На главную">
          <div className="brand__mark">
            <Icon name="check" />
          </div>
          <div>
            <div className="brand__name">
              TK<b>.</b>Tasks
            </div>
            <div className="brand__sub">Личный планировщик</div>
          </div>
        </Link>
        <div className="nav-label">Меню</div>
        <nav className="sidebar__nav">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item ${item.active ? "active" : ""}`}
            >
              <Icon name={item.icon} />
              {item.label}
              {item.count ? (
                <span className="nav-count">{item.count}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="nav-label">Категории</div>
        <nav className="sidebar__nav sidebar__nav--categories">
          {Object.entries(taskCategories).map(([key, category]) => {
            const categoryKey = key as TaskCategory;
            return (
              <Link
                key={key}
                to={`${routes.tasks}?filter=all&category=${key}`}
                className={`nav-item ${
                  location.pathname === routes.tasks && activeCategory === key
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-category-dot">
                  <i
                    className="cat-dot"
                    style={{ background: category.color }}
                  />
                </span>
                {category.label}
                <span className="nav-count">
                  {categoryCounts[categoryKey] ?? 0}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar__spacer" />
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="greet">
            <h1>{getTitle(location.pathname)}</h1>
            <p>{dateLabel}</p>
          </div>
          <label className="search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск задач…"
            />
          </label>
          <button className="icon-btn">
            <Icon name="bell" />
            <span />
          </button>
          <button className="avatar-btn">
            <img src="https://i.pravatar.cc/100?img=12" alt="Профиль" />
          </button>
        </header>
        <div className="mobile-search">
          <label className="search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск задач…"
            />
          </label>
        </div>
        <div className="content-scroll">
          <Outlet context={{ query } satisfies AppLayoutContext} />
        </div>
      </main>
      <nav className="mobile-nav">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === routes.dashboard}
            className={({ isActive }) => (isActive ? "active" : "")}
            aria-label={item.label}
          >
            <Icon name={item.icon} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
