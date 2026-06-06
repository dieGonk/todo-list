/* ============ Task list view — add / check / filter / delete ============ */
function TaskList({ tasks, open, toggle, add, del, star, query, setQuery }) {
  const [filter, setFilter] = React.useState("today");
  const [cat, setCat] = React.useState("all");
  const [sort, setSort] = React.useState("time");
  const [draft, setDraft] = React.useState("");
  const [draftCat, setDraftCat] = React.useState("work");
  const [draftPrio, setDraftPrio] = React.useState("med");

  const submit = () => {
    if (!draft.trim()) return;
    add({ title: draft.trim(), cat: draftCat, prio: draftPrio });
    setDraft("");
  };

  const counts = {
    today: tasks.filter((t) => t.date === todayISO()).length,
    upcoming: tasks.filter((t) => t.date > todayISO()).length,
    all: tasks.length,
    done: tasks.filter((t) => t.done).length,
    starred: tasks.filter((t) => t.starred).length,
  };

  let list = tasks.filter((t) => {
    if (filter === "today" && t.date !== todayISO()) return false;
    if (filter === "upcoming" && !(t.date > todayISO())) return false;
    if (filter === "done" && !t.done) return false;
    if (filter === "starred" && !t.starred) return false;
    if (cat !== "all" && t.cat !== cat) return false;
    if (query && !t.title.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });
  list = [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (sort === "prio") {
      const o = { high: 0, med: 1, low: 2 };
      return o[a.prio] - o[b.prio];
    }
    if (sort === "time")
      return (a.date + a.time).localeCompare(b.date + b.time);
    return 0;
  });

  const FILTERS = [
    { k: "today", l: "Сегодня", i: "sun" },
    { k: "upcoming", l: "Предстоит", i: "clock" },
    { k: "starred", l: "Важное", i: "star" },
    { k: "all", l: "Все", i: "list" },
    { k: "done", l: "Готово", i: "check" },
  ];

  return (
    <div className="page fade">
      {/* add bar */}
      <div className="add-bar">
        <div className="plus">
          <Icon n="plus" style={{ width: 14, height: 14 }} />
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Добавить задачу на сегодня…"
        />
        <CatPick value={draftCat} onChange={setDraftCat} />
        <PrioPick value={draftPrio} onChange={setDraftPrio} />
        <button className="submit" onClick={submit} disabled={!draft.trim()}>
          <Icon n="plus" />
          Добавить
        </button>
      </div>

      {/* filters */}
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            className={"chip" + (filter === f.k ? " on" : "")}
            onClick={() => setFilter(f.k)}
          >
            <Icon n={f.i} style={{ width: 14, height: 14 }} />
            {f.l}
            <span className="c">{counts[f.k]}</span>
          </button>
        ))}
        <div className="sort">
          <SortPick value={sort} onChange={setSort} />
        </div>
      </div>

      {/* category row */}
      <div className="filters" style={{ marginTop: -6, marginBottom: 20 }}>
        <button
          className={"chip" + (cat === "all" ? " on" : "")}
          onClick={() => setCat("all")}
          style={{ fontSize: 12, padding: "7px 13px" }}
        >
          Все категории
        </button>
        {Object.entries(CATS).map(([k, c]) => (
          <button
            key={k}
            className={"chip" + (cat === k ? " on" : "")}
            onClick={() => setCat(k)}
            style={{ fontSize: 12, padding: "7px 13px" }}
          >
            <i className="cat-dot" style={{ background: c.color }}></i>
            {c.label}
          </button>
        ))}
      </div>

      {/* list */}
      {list.length ? (
        list.map((t) => {
          const c = CATS[t.cat];
          const subDone = t.subs.filter((s) => s.done).length;
          return (
            <div
              className={"task" + (t.done ? " done" : "")}
              key={t.id}
              onClick={() => open("detail", t.id)}
            >
              <Check
                on={t.done}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(t.id);
                }}
              />
              <div className="body">
                <div className="title">{t.title}</div>
                <div className="meta">
                  <span className="m">
                    <i className="cat-dot" style={{ background: c.color }}></i>
                    {c.label}
                  </span>
                  <span className="m">
                    <Icon n="clock" />
                    {t.time}
                  </span>
                  <span
                    className="badge {p}"
                    style={{
                      background:
                        t.prio === "high"
                          ? "var(--red-soft)"
                          : t.prio === "med"
                            ? "var(--gold-soft)"
                            : "var(--green-soft)",
                      color:
                        t.prio === "high"
                          ? "var(--red)"
                          : t.prio === "med"
                            ? "var(--gold)"
                            : "var(--green)",
                    }}
                  >
                    {PRIO[t.prio].label}
                  </span>
                  {t.subs.length > 0 && (
                    <span className="m">
                      <Icon n="list" />
                      {subDone}/{t.subs.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="right">
                <button
                  className={"star" + (t.starred ? " on" : "")}
                  onClick={(e) => {
                    e.stopPropagation();
                    star(t.id);
                  }}
                >
                  <Icon n="star" style={{ width: 18, height: 18 }} />
                </button>
                <button
                  className="del"
                  onClick={(e) => {
                    e.stopPropagation();
                    del(t.id);
                  }}
                >
                  <Icon n="trash" style={{ width: 16, height: 16 }} />
                </button>
                <Icon
                  n="chevRight"
                  className="handle"
                  style={{ width: 18, height: 18 }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty">
          <div className="e-ico">
            <Icon n="inbox" />
          </div>
          <h3>Здесь пока пусто</h3>
          <p>Добавь первую задачу — она появится в списке.</p>
        </div>
      )}
    </div>
  );
}

/* inline pickers */
function CatPick({ value, onChange }) {
  const [o, setO] = React.useState(false);
  const c = CATS[value];
  return (
    <div style={{ position: "relative" }}>
      <button
        className="chip"
        style={{ padding: "8px 12px" }}
        onClick={() => setO(!o)}
      >
        <i className="cat-dot" style={{ background: c.color }}></i>
        {c.label}
        <Icon n="chevDown" style={{ width: 13, height: 13 }} />
      </button>
      {o && (
        <Pop onClose={() => setO(false)}>
          {Object.entries(CATS).map(([k, cc]) => (
            <button
              key={k}
              className="pop-item"
              onClick={() => {
                onChange(k);
                setO(false);
              }}
            >
              <i className="cat-dot" style={{ background: cc.color }}></i>
              {cc.label}
            </button>
          ))}
        </Pop>
      )}
    </div>
  );
}
function PrioPick({ value, onChange }) {
  const [o, setO] = React.useState(false);
  const col =
    value === "high"
      ? "var(--red)"
      : value === "med"
        ? "var(--gold)"
        : "var(--green)";
  return (
    <div style={{ position: "relative" }}>
      <button
        className="chip"
        style={{ padding: "8px 12px" }}
        onClick={() => setO(!o)}
      >
        <Icon n="flag" style={{ width: 14, height: 14, color: col }} />
        {PRIO[value].label}
        <Icon n="chevDown" style={{ width: 13, height: 13 }} />
      </button>
      {o && (
        <Pop onClose={() => setO(false)}>
          {Object.entries(PRIO).map(([k, p]) => (
            <button
              key={k}
              className="pop-item"
              onClick={() => {
                onChange(k);
                setO(false);
              }}
            >
              <Icon
                n="flag"
                style={{ width: 14, height: 14, color: p.color }}
              />
              {p.label}
            </button>
          ))}
        </Pop>
      )}
    </div>
  );
}
function SortPick({ value, onChange }) {
  const [o, setO] = React.useState(false);
  const labels = { time: "По времени", prio: "По приоритету" };
  return (
    <div style={{ position: "relative" }}>
      <button className="chip" onClick={() => setO(!o)}>
        <Icon n="filter" style={{ width: 14, height: 14 }} />
        {labels[value]}
        <Icon n="chevDown" style={{ width: 13, height: 13 }} />
      </button>
      {o && (
        <Pop onClose={() => setO(false)} align="right">
          {Object.entries(labels).map(([k, l]) => (
            <button
              key={k}
              className="pop-item"
              onClick={() => {
                onChange(k);
                setO(false);
              }}
            >
              {l}
            </button>
          ))}
        </Pop>
      )}
    </div>
  );
}
function Pop({ children, onClose, align }) {
  React.useEffect(() => {
    const h = () => onClose();
    const t = setTimeout(() => document.addEventListener("click", h), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", h);
    };
  }, []);
  return (
    <div
      className="pop"
      style={align === "right" ? { right: 0 } : { left: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

Object.assign(window, { TaskList });
