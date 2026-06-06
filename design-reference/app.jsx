/* ============ App shell ============ */
const { useState, useEffect } = React;

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [view, setView] = useState("dash"); // dash | list | detail
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => saveTasks(tasks), [tasks]);

  const open = (v, id) => {
    setView(v);
    if (id !== undefined) setActiveId(id);
    document.querySelector(".scroll")?.scrollTo({ top: 0 });
  };

  // mutations
  const toggle = (id) =>
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  const star = (id) =>
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)),
    );
  const del = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = ({ title, cat, prio }) => {
    const now = new Date();
    const time =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    setTasks((ts) => [
      {
        id: uid(),
        title,
        cat,
        prio,
        date: todayISO(),
        time,
        notes: "",
        done: false,
        starred: false,
        subs: [],
      },
      ...ts,
    ]);
  };
  const setPrio = (id, p) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, prio: p } : t)));
  const addSub = (id, text) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, subs: [...t.subs, { id: uid(), t: text, done: false }] }
          : t,
      ),
    );
  const toggleSub = (id, sid) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              subs: t.subs.map((s) =>
                s.id === sid ? { ...s, done: !s.done } : s,
              ),
            }
          : t,
      ),
    );

  const activeTask = tasks.find((t) => t.id === activeId);
  const todayCount = tasks.filter(
    (t) => t.date === todayISO() && !t.done,
  ).length;
  const starCount = tasks.filter((t) => t.starred).length;
  const upCount = tasks.filter((t) => t.date > todayISO() && !t.done).length;

  const NAV = [
    { k: "dash", l: "Обзор", i: "grid" },
    { k: "list", l: "Мои задачи", i: "list", c: todayCount },
    { k: "cal", l: "Календарь", i: "calendar" },
    { k: "star", l: "Важное", i: "star", c: starCount },
  ];

  const goNav = (k) => {
    if (k === "star") {
      open("list");
      setQuery("");
    } else open(k);
  };
  const navActive = (k) => {
    if (view === "detail" && k === "list") return true;
    return view === k;
  };

  const dateStr = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="side">
        <div className="brand">
          <div className="brand-mark">
            <Icon n="check" />
          </div>
          <div>
            <div className="brand-name">
              TK<b>.</b>Tasks
            </div>
            <div className="brand-sub">Личный планировщик</div>
          </div>
        </div>

        <div className="nav-label">Меню</div>
        {NAV.map((n) => (
          <button
            key={n.k}
            className={"nav-item" + (navActive(n.k) ? " active" : "")}
            onClick={() => goNav(n.k)}
          >
            <Icon n={n.i} />
            {n.l}
            {n.c > 0 && <span className="nav-count">{n.c}</span>}
          </button>
        ))}

        <div className="nav-label">Категории</div>
        {Object.entries(CATS).map(([k, c]) => (
          <button key={k} className="nav-item" onClick={() => open("list")}>
            <span style={{ width: 20, display: "grid", placeItems: "center" }}>
              <i
                className="cat-dot"
                style={{ background: c.color, width: 9, height: 9 }}
              ></i>
            </span>
            {c.label}
            <span className="nav-count">
              {tasks.filter((t) => t.cat === k && !t.done).length}
            </span>
          </button>
        ))}

        <div className="side-spacer"></div>
        <div className="side-card">
          <h4>✨ TK Pro</h4>
          <p>
            Безлимит задач, умные напоминания и синхронизация на всех
            устройствах.
          </p>
          <button className="pro-btn">Перейти на Pro</button>
        </div>
      </aside>

      {/* main */}
      <div className="main">
        <header className="topbar">
          <div className="greet">
            <h1>
              {view === "dash"
                ? "Привет, Алекс 👋"
                : view === "cal"
                  ? "Календарь"
                  : view === "detail"
                    ? "Детали задачи"
                    : "Мои задачи"}
            </h1>
            <p style={{ textTransform: "capitalize" }}>{dateStr}</p>
          </div>
          <div className="search">
            <Icon n="search" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value && view !== "list") open("list");
              }}
              placeholder="Поиск задач…"
            />
          </div>
          <button className="icon-btn">
            <Icon n="globe" />
          </button>
          <button className="icon-btn">
            <Icon n="bell" />
            <span className="dot"></span>
          </button>
          <button className="avatar-btn">
            <img src="https://i.pravatar.cc/100?img=12" alt="me" />
          </button>
        </header>

        {/* mobile search */}
        <div className="mobile-search" style={{ padding: "0 16px 12px" }}>
          <div className="search" style={{ width: "100%", marginLeft: 0 }}>
            <Icon n="search" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value && view !== "list") open("list");
              }}
              placeholder="Поиск задач…"
            />
          </div>
        </div>

        <div className="scroll">
          {view === "dash" && (
            <Dashboard tasks={tasks} open={open} toggle={toggle} />
          )}
          {view === "list" && (
            <TaskList
              tasks={tasks}
              open={open}
              toggle={toggle}
              add={add}
              del={del}
              star={star}
              query={query}
              setQuery={setQuery}
            />
          )}
          {view === "detail" && (
            <TaskDetail
              task={activeTask}
              open={open}
              toggle={toggle}
              del={del}
              star={star}
              addSub={addSub}
              toggleSub={toggleSub}
              setPrio={setPrio}
            />
          )}
          {view === "cal" && <CalendarView tasks={tasks} open={open} />}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="mobile-nav">
        <button
          className={navActive("dash") ? "active" : ""}
          onClick={() => open("dash")}
        >
          <Icon n="grid" />
        </button>
        <button
          className={navActive("list") ? "active" : ""}
          onClick={() => open("list")}
        >
          <Icon n="list" />
        </button>
        <button className="add" onClick={() => open("list")}>
          <Icon n="plus" />
        </button>
        <button
          className={view === "cal" ? "active" : ""}
          onClick={() => open("cal")}
        >
          <Icon n="calendar" />
        </button>
        <button onClick={() => open("list")}>
          <Icon n="user" />
        </button>
      </nav>
    </div>
  );
}

/* ---- simple calendar view ---- */
function CalendarView({ tasks, open }) {
  const now = new Date();
  const y = now.getFullYear(),
    m = now.getMonth();
  const first = new Date(y, m, 1).getDay() || 7; // mon=1
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 1; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const iso = (d) => new Date(y, m, d).toLocaleDateString("sv").slice(0, 10);
  const dows = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="page fade">
      <div className="card" style={{ padding: 24, maxWidth: 760 }}>
        <div className="sec-head">
          <h2 style={{ textTransform: "capitalize" }}>
            {now.toLocaleDateString("ru-RU", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 8,
          }}
        >
          {dows.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-3)",
                fontWeight: 600,
                padding: "4px 0",
              }}
            >
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i}></div>;
            const dayTasks = tasks.filter((t) => t.date === iso(d));
            const isToday = iso(d) === todayISO();
            return (
              <button
                key={i}
                onClick={() => dayTasks[0] && open("detail", dayTasks[0].id)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 14,
                  padding: 8,
                  textAlign: "left",
                  position: "relative",
                  background: isToday ? "var(--gold-soft)" : "var(--surface-2)",
                  border:
                    "1px solid " +
                    (isToday ? "var(--gold-line)" : "var(--line)"),
                  color: isToday ? "var(--gold-2)" : "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {d}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    display: "flex",
                    gap: 3,
                    flexWrap: "wrap",
                  }}
                >
                  {dayTasks.slice(0, 3).map((t) => (
                    <i
                      key={t.id}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: t.done ? "var(--green)" : CATS[t.cat].color,
                      }}
                    ></i>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
