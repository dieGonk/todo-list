import { NavLink, Outlet, useLocation } from "react-router";
import { routes } from "../../shared/config/routes";
import { Icon } from "../../shared/ui/Icon";
import type { IconName } from "../../shared/ui/Icon";
import { useState } from "react";

export type AppLayoutContext = {
  query: string;
};

const navItems: Array<{ to: string; label: string; icon: IconName }> = [
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
  const dateLabel = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">
            <Icon name="check" />
          </div>
          <div>
            <div className="brand__name">
              TK<b>.</b>Tasks
            </div>
            <div className="brand__sub">Личный планировщик</div>
          </div>
        </div>
        <div className="nav-label">Меню</div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === routes.dashboard}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
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
        {navItems.map((item) => (
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
