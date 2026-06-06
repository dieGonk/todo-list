/* ============ Dashboard view ============ */
function Dashboard({ tasks, open, toggle }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const inProgress = tasks.filter((t) => !t.done).length;
  const todayTasks = tasks.filter((t) => t.date === todayISO());
  const todayDone = todayTasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const todayPct = todayTasks.length
    ? Math.round((todayDone / todayTasks.length) * 100)
    : 0;
  const upcoming = tasks.filter((t) => !t.done && t.date > todayISO()).length;
  const streak = 12;

  const peak = WEEK_DATA.indexOf(Math.max(...WEEK_DATA));
  const next = todayTasks.filter((t) => !t.done).slice(0, 4);

  return (
    <div className="page fade">
      {/* stats */}
      <div className="stat-row">
        <div className="stat">
          <div className="ico gold">
            <Icon n="target" />
          </div>
          <div className="num">{inProgress}</div>
          <div className="lab">Активных задач</div>
          <div className="trend">
            <Icon n="trend" style={{ width: 13, height: 13 }} />
            +3
          </div>
        </div>
        <div className="stat">
          <div className="ico green">
            <Icon n="check" />
          </div>
          <div className="num">{done}</div>
          <div className="lab">Выполнено всего</div>
          <div className="trend">
            <Icon n="trend" style={{ width: 13, height: 13 }} />+{done}
          </div>
        </div>
        <div className="stat">
          <div className="ico violet">
            <Icon n="fire" />
          </div>
          <div className="num">
            {streak}
            <span style={{ fontSize: 16, color: "var(--text-3)" }}> дн.</span>
          </div>
          <div className="lab">Серия без пропусков</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* left: chart + today */}
        <div>
          <div className="card chart-card">
            <div className="chart-head">
              <h3>Продуктивность</h3>
              <div style={{ marginLeft: "auto" }} className="pill">
                <Icon n="calendar" />
                Последние 7 дней
                <Icon n="chevDown" />
              </div>
            </div>
            <div className="legend">
              <div className="li">
                <div
                  className="d"
                  style={{
                    background: "var(--gold-soft)",
                    color: "var(--gold)",
                  }}
                >
                  <Icon n="loader" />
                </div>
                <div>
                  <div className="v">{inProgress}</div>
                  <div className="t">В работе</div>
                </div>
              </div>
              <div className="li">
                <div
                  className="d"
                  style={{
                    background: "var(--green-soft)",
                    color: "var(--green)",
                  }}
                >
                  <Icon n="check" />
                </div>
                <div>
                  <div className="v">{done}</div>
                  <div className="t">Завершено</div>
                </div>
              </div>
              <div className="li">
                <div
                  className="d"
                  style={{
                    background: "var(--violet-soft)",
                    color: "var(--violet)",
                  }}
                >
                  <Icon n="clock" />
                </div>
                <div>
                  <div className="v">{upcoming}</div>
                  <div className="t">Предстоит</div>
                </div>
              </div>
            </div>
            <AreaChart data={WEEK_DATA} labels={WEEK_LABELS} peakIdx={peak} />
          </div>

          <div className="dash-tasks">
            <div className="sec-head" style={{ marginTop: 26 }}>
              <h2>На сегодня</h2>
              <button className="see" onClick={() => open("list")}>
                Все задачи <Icon n="chevRight" />
              </button>
            </div>
            {next.length ? (
              next.map((t) => {
                const c = CATS[t.cat];
                return (
                  <div
                    className="mini-task"
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
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                        {t.title}
                      </div>
                      <div
                        className="meta"
                        style={{ display: "flex", gap: 12, marginTop: 5 }}
                      >
                        <span
                          className="m"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            color: "var(--text-3)",
                          }}
                        >
                          <i
                            className="cat-dot"
                            style={{ background: c.color }}
                          ></i>
                          {c.label}
                        </span>
                      </div>
                    </div>
                    <div className="when">
                      <b style={{ color: "var(--gold)" }}>{t.time}</b>
                      <small>{PRIO[t.prio].label}</small>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="mini-task"
                style={{ justifyContent: "center", color: "var(--text-3)" }}
              >
                Всё на сегодня выполнено 🎉
              </div>
            )}
          </div>
        </div>

        {/* right: ring */}
        <div className="card ring-card">
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-2)",
              alignSelf: "flex-start",
              marginBottom: 4,
            }}
          >
            Прогресс дня
          </h4>
          <div className="ring-wrap">
            <Ring pct={todayPct} />
            <div className="ring-center">
              <div className="pct">
                {todayPct}
                <span>%</span>
              </div>
              <div className="cap">
                {todayDone} из {todayTasks.length} задач
              </div>
            </div>
          </div>
          <div className="ring-legend">
            <div className="it">
              <div className="top">
                <i style={{ background: "var(--gold)" }}></i>Выполнено
              </div>
              <div className="big">{todayDone}</div>
            </div>
            <div className="it">
              <div className="top">
                <i style={{ background: "var(--surface-3)" }}></i>Осталось
              </div>
              <div className="big">{todayTasks.length - todayDone}</div>
            </div>
          </div>
          <div style={{ width: "100%", marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--text-3)",
                marginBottom: 8,
              }}
            >
              <span>Общий прогресс</span>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                {pct}%
              </span>
            </div>
            <Bar pct={pct} />
          </div>
        </div>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
