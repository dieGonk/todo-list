/* ============ Icons — clean 24px line set ============ */
const ICONS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  check: "M5 12.5l4.2 4.2L19 7",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  globe:
    "M12 21a9 9 0 100-18 9 9 0 000 18zM3.5 9h17M3.5 15h17M12 3a14 14 0 000 18M12 3a14 14 0 010 18",
  calendar:
    "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  trash:
    "M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  chevLeft: "M15 6l-6 6 6 6",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  fire: "M12 22c4 0 7-2.7 7-6.5 0-3.5-2.5-5-3.5-7.5-1.4 1-1.5 2.5-1.5 2.5S12 7 11 4.5C9.5 6 5 8.5 5 14c0 4 3 8 7 8z",
  target:
    "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  loader:
    "M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  chart: "M5 21V10M12 21V4M19 21v-7",
  inbox:
    "M3 12h5l2 3h4l2-3h5M4 6h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1.1-2.7H3a2 2 0 110-4h.2a1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H10a1.6 1.6 0 001-1.5V3a2 2 0 014 0v.2a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a1.6 1.6 0 001.5 1H21a2 2 0 010 4h-.2a1.6 1.6 0 00-1.5 1z",
  briefcase:
    "M4 8h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18",
  heart:
    "M12 20s-7-4.5-9.2-9C1.3 8 2.5 4.5 6 4.5c2 0 3.2 1.3 4 2.5.8-1.2 2-2.5 4-2.5 3.5 0 4.7 3.5 3.2 6.5C19 15.5 12 20 12 20z",
  book: "M4 5a2 2 0 012-2h8v16H6a2 2 0 00-2 2V5zM14 3h4a2 2 0 012 2v14a2 2 0 00-2-2h-4",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19",
  cart: "M3 4h2l2.4 12.4a1 1 0 001 .8h9.2a1 1 0 001-.8L21 8H6M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  x: "M6 6l12 12M18 6L6 18",
  filter: "M3 5h18l-7 8v6l-4-2v-4z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  chat: "M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z",
  link: "M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5",
};

function Icon({ n, style, className }) {
  const d = ICONS[n] || "";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={"M" + seg} />
        ))}
    </svg>
  );
}

/* ---- Category meta ---- */
const CATS = {
  work: { label: "Работа", color: "#e9c486", icon: "briefcase" },
  personal: { label: "Личное", color: "#b69bf0", icon: "user" },
  health: { label: "Здоровье", color: "#74d39a", icon: "heart" },
  learning: { label: "Обучение", color: "#7bb0f1", icon: "book" },
  home: { label: "Дом", color: "#ef9f70", icon: "sun" },
};
const PRIO = {
  high: { label: "Высокий", color: "var(--red)" },
  med: { label: "Средний", color: "var(--gold)" },
  low: { label: "Низкий", color: "var(--green)" },
};

/* ---- small reusable bits ---- */
function Check({ on, onClick, size }) {
  return (
    <button
      className={"check" + (on ? " on" : "")}
      onClick={onClick}
      style={size ? { width: size, height: size } : null}
      aria-label="toggle"
    >
      <Icon n="check" />
    </button>
  );
}

function Bar({ pct }) {
  return (
    <div className="bar">
      <i style={{ width: Math.max(0, Math.min(100, pct)) + "%" }} />
    </div>
  );
}

/* circular progress ring */
function Ring({ pct, size = 188, stroke = 16, track = "var(--surface-3)" }) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r,
    off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d39e" />
          <stop offset="1" stopColor="#d4a85f" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={track}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ringg)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

/* smooth area chart */
function AreaChart({ data, labels, peakIdx }) {
  const W = 520,
    H = 200,
    pad = 10;
  const max = Math.max(...data) * 1.15 || 1;
  const xs = data.map((_, i) => pad + (i * (W - pad * 2)) / (data.length - 1));
  const ys = data.map((v) => H - 8 - (v / max) * (H - 30));
  // catmull-rom -> bezier
  const path = () => {
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x0 = xs[i - 1] ?? xs[i],
        y0 = ys[i - 1] ?? ys[i];
      const x1 = xs[i],
        y1 = ys[i],
        x2 = xs[i + 1],
        y2 = ys[i + 1];
      const x3 = xs[i + 2] ?? x2,
        y3 = ys[i + 2] ?? y2;
      const c1x = x1 + (x2 - x0) / 6,
        c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6,
        c2y = y2 - (y3 - y1) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
    }
    return d;
  };
  const line = path();
  const area = `${line} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;
  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(233,196,134,.32)" />
            <stop offset="1" stopColor="rgba(233,196,134,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areag)" />
        <path
          d={line}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {peakIdx != null && (
          <>
            <line
              x1={xs[peakIdx]}
              y1={ys[peakIdx]}
              x2={xs[peakIdx]}
              y2={H}
              stroke="var(--gold-line)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />
            <circle
              cx={xs[peakIdx]}
              cy={ys[peakIdx]}
              r="5.5"
              fill="var(--gold)"
              stroke="var(--surface)"
              strokeWidth="3"
            />
          </>
        )}
      </svg>
      {peakIdx != null && (
        <div
          style={{
            position: "absolute",
            left: `${(xs[peakIdx] / W) * 100}%`,
            top: `${(ys[peakIdx] / H) * 100}%`,
            transform: "translate(-50%,-150%)",
            background: "var(--gold)",
            color: "#1a1407",
            fontWeight: 700,
            fontSize: "12px",
            padding: "3px 9px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
          }}
        >
          {data[peakIdx]} задач
        </div>
      )}
      <div className="x-axis">
        {labels.map((l, i) => (
          <span key={i} className={i === peakIdx ? "on" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, ICONS, CATS, PRIO, Check, Bar, Ring, AreaChart });
