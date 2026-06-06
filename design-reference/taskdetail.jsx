/* ============ Task detail view ============ */
function TaskDetail({
  task,
  open,
  toggle,
  del,
  star,
  addSub,
  toggleSub,
  setPrio,
}) {
  const [subDraft, setSubDraft] = React.useState("");
  if (!task)
    return (
      <div className="page fade">
        <div className="empty">
          <div className="e-ico">
            <Icon n="inbox" />
          </div>
          <h3>Задача не найдена</h3>
          <p>Возможно, она была удалена.</p>
        </div>
      </div>
    );
  const c = CATS[task.cat];
  const subDone = task.subs.filter((s) => s.done).length;
  const subPct = task.subs.length
    ? Math.round((subDone / task.subs.length) * 100)
    : task.done
      ? 100
      : 0;
  const dateLabel = (() => {
    const t = todayISO();
    if (task.date === t) return "Сегодня";
    if (task.date === addDays(1)) return "Завтра";
    if (task.date === addDays(-1)) return "Вчера";
    const d = new Date(task.date);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  })();

  const submitSub = () => {
    if (!subDraft.trim()) return;
    addSub(task.id, subDraft.trim());
    setSubDraft("");
  };

  return (
    <div className="page fade">
      <button className="back-btn" onClick={() => open("list")}>
        <Icon n="chevLeft" />К списку задач
      </button>
      <div className="detail">
        <div className="card detail-main">
          <div className="dtitle">
            <Check on={task.done} onClick={() => toggle(task.id)} size={28} />
            <h1 className={task.done ? "done" : ""}>{task.title}</h1>
            <button
              className={"star" + (task.starred ? " on" : "")}
              onClick={() => star(task.id)}
            >
              <Icon n="star" style={{ width: 22, height: 22 }} />
            </button>
          </div>

          <div className="detail-meta">
            <div className="dmeta">
              <Icon n={c.icon} />
              <div>
                <div className="k">Категория</div>
                <div className="v" style={{ color: c.color }}>
                  {c.label}
                </div>
              </div>
            </div>
            <div className="dmeta">
              <Icon n="calendar" />
              <div>
                <div className="k">Дата</div>
                <div className="v">{dateLabel}</div>
              </div>
            </div>
            <div className="dmeta">
              <Icon n="clock" />
              <div>
                <div className="k">Время</div>
                <div className="v">{task.time}</div>
              </div>
            </div>
            <div className="dmeta">
              <Icon n="flag" style={{ color: PRIO[task.prio].color }} />
              <div>
                <div className="k">Приоритет</div>
                <div className="v" style={{ color: PRIO[task.prio].color }}>
                  {PRIO[task.prio].label}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-h">Заметка</div>
          <p className="note">{task.notes || "Без описания."}</p>

          <div className="detail-h">
            Подзадачи{" "}
            <span className="cnt">
              {subDone}/{task.subs.length}
            </span>
          </div>
          {task.subs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Bar pct={subPct} />
            </div>
          )}
          {task.subs.map((s) => (
            <div className={"sub" + (s.done ? " done" : "")} key={s.id}>
              <Check
                on={s.done}
                onClick={() => toggleSub(task.id, s.id)}
                size={21}
              />
              <span className="stxt">{s.t}</span>
            </div>
          ))}
          <div className="add-sub">
            <Icon n="plus" />
            <input
              value={subDraft}
              onChange={(e) => setSubDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSub()}
              placeholder="Добавить подзадачу…"
            />
          </div>
        </div>

        {/* side */}
        <div className="detail-side">
          <div className="card side-panel">
            <h4>Прогресс</h4>
            <div className="prog-big">
              <Ring pct={subPct} size={64} stroke={8} />
              <div>
                <div className="pn">{subPct}%</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {task.done
                    ? "Задача выполнена"
                    : `${subDone} из ${task.subs.length} шагов`}
                </div>
              </div>
            </div>
          </div>

          <div className="card side-panel">
            <h4>Приоритет</h4>
            <div className="prio-opts">
              {Object.entries(PRIO).map(([k, p]) => (
                <button
                  key={k}
                  className={"prio-opt " + k + (task.prio === k ? " on" : "")}
                  onClick={() => setPrio(task.id, k)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card side-panel">
            <h4>Детали</h4>
            <div className="kv">
              <Icon n="calendar" />
              <span className="kk">Срок</span>
              <span className="vv">
                {dateLabel}, {task.time}
              </span>
            </div>
            <div className="kv">
              <Icon n="bell" />
              <span className="kk">Напоминание</span>
              <span className="vv">За 30 мин</span>
            </div>
            <div className="kv">
              <Icon n="loader" />
              <span className="kk">Статус</span>
              <span
                className="vv"
                style={{ color: task.done ? "var(--green)" : "var(--gold)" }}
              >
                {task.done ? "Готово" : "В работе"}
              </span>
            </div>
          </div>

          <button
            className="detail-del"
            onClick={() => {
              del(task.id);
              open("list");
            }}
          >
            <Icon n="trash" />
            Удалить задачу
          </button>
        </div>
      </div>
    </div>
  );
}
window.TaskDetail = TaskDetail;
