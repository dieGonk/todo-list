/* ============ Auth — login / register ============ */
function Auth({ onAuth }) {
  const [mode, setMode] = React.useState("login"); // login | register
  const isReg = mode === "register";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [err, setErr] = React.useState("");

  const submit = () => {
    if (isReg && !name.trim()) return setErr("Введите имя");
    if (!email.trim() || !email.includes("@"))
      return setErr("Введите корректный e-mail");
    if (pass.length < 4) return setErr("Пароль не короче 4 символов");
    setErr("");
    onAuth({ name: isReg ? name.trim() : "Алекс", email: email.trim() });
  };

  const passStrength = (() => {
    let s = 0;
    if (pass.length >= 4) s++;
    if (pass.length >= 8) s++;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) s++;
    if (/[^a-zA-Z0-9]/.test(pass)) s++;
    return s; // 0..4
  })();
  const strengthLabel = ["Слабый", "Слабый", "Средний", "Хороший", "Надёжный"][
    passStrength
  ];
  const strengthColor = [
    "var(--text-4)",
    "var(--red)",
    "var(--gold)",
    "var(--green)",
    "var(--green)",
  ][passStrength];

  return (
    <div className="auth">
      {/* left showcase */}
      <div className="auth-show">
        <div className="auth-glow auth-glow-1"></div>
        <div className="auth-glow auth-glow-2"></div>
        <div className="auth-show-inner">
          <div className="brand" style={{ padding: 0, marginBottom: "auto" }}>
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

          <div className="auth-pitch">
            <div className="auth-tag">
              <span className="dot-g"></span>Спланируй свой день красиво
            </div>
            <h2>
              Меньше хаоса.
              <br />
              Больше выполнено.
            </h2>
            <p>
              Собери все свои дела в одном месте — задачи, подзадачи, приоритеты
              и прогресс. Каждый день под контролем.
            </p>

            <div className="auth-mini-card">
              <div className="amc-head">
                <div
                  className="ico gold"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon n="fire" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div className="amc-n">Серия 12 дней</div>
                  <div className="amc-s">Ты в отличной форме 🔥</div>
                </div>
                <div className="amc-pct">87%</div>
              </div>
              <div className="bar" style={{ marginTop: 14 }}>
                <i style={{ width: "87%" }}></i>
              </div>
              <div className="amc-row">
                <div className="amc-stat">
                  <b>48</b>
                  <span>выполнено</span>
                </div>
                <div className="amc-stat">
                  <b>6</b>
                  <span>в работе</span>
                </div>
                <div className="amc-stat">
                  <b>5</b>
                  <span>категорий</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-foot">
            <div className="stack">
              <img src="https://i.pravatar.cc/60?img=15" />
              <img src="https://i.pravatar.cc/60?img=33" />
              <img src="https://i.pravatar.cc/60?img=8" />
              <span className="more">12k</span>
            </div>
            <span>уже планируют день вместе с нами</span>
          </div>
        </div>
      </div>

      {/* right form */}
      <div className="auth-form-wrap">
        <div className="auth-form fade">
          <div className="auth-mobile-brand">
            <div className="brand-mark">
              <Icon n="check" />
            </div>
            <div className="brand-name">
              TK<b>.</b>Tasks
            </div>
          </div>

          <div className="auth-switch">
            <button
              className={!isReg ? "on" : ""}
              onClick={() => {
                setMode("login");
                setErr("");
              }}
            >
              Вход
            </button>
            <button
              className={isReg ? "on" : ""}
              onClick={() => {
                setMode("register");
                setErr("");
              }}
            >
              Регистрация
            </button>
          </div>

          <h1 className="auth-h1">
            {isReg ? "Создать аккаунт" : "С возвращением 👋"}
          </h1>
          <p className="auth-sub">
            {isReg
              ? "Пара секунд — и начнём планировать."
              : "Войди, чтобы продолжить со своими задачами."}
          </p>

          <div className="auth-social">
            <button className="soc-btn">
              <GoogleG />
              Google
            </button>
            <button className="soc-btn">
              <Icon n="globe" style={{ width: 18, height: 18 }} />
              Apple
            </button>
          </div>
          <div className="auth-or">
            <span>или через e-mail</span>
          </div>

          {isReg && (
            <Field label="Имя" icon="user">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как тебя зовут?"
              />
            </Field>
          )}
          <Field label="E-mail" icon="inbox">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Пароль" icon="link">
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••••"
            />
            <button
              className="eye"
              onClick={() => setShow(!show)}
              tabIndex={-1}
            >
              <Icon
                n={show ? "sun" : "globe"}
                style={{ width: 17, height: 17 }}
              />
            </button>
          </Field>

          {isReg && pass.length > 0 && (
            <div className="strength">
              <div className="strength-bars">
                {[0, 1, 2, 3].map((i) => (
                  <i
                    key={i}
                    style={{
                      background:
                        i < passStrength ? strengthColor : "var(--surface-3)",
                    }}
                  ></i>
                ))}
              </div>
              <span style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}

          {!isReg && (
            <div className="auth-aux">
              <button className="cb" onClick={() => setRemember(!remember)}>
                <span className={"cbx" + (remember ? " on" : "")}>
                  {remember && (
                    <Icon
                      n="check"
                      style={{ width: 11, height: 11, strokeWidth: 3.4 }}
                    />
                  )}
                </span>
                Запомнить меня
              </button>
              <button className="link-btn">Забыли пароль?</button>
            </div>
          )}

          {err && (
            <div className="auth-err">
              <Icon n="flag" style={{ width: 14, height: 14 }} />
              {err}
            </div>
          )}

          <button className="auth-submit" onClick={submit}>
            {isReg ? "Создать аккаунт" : "Войти"}
            <Icon n="arrowRight" style={{ width: 18, height: 18 }} />
          </button>

          {isReg && (
            <p className="auth-terms">
              Регистрируясь, ты принимаешь <a>Условия</a> и{" "}
              <a>Политику конфиденциальности</a>.
            </p>
          )}

          <p className="auth-alt">
            {isReg ? "Уже есть аккаунт? " : "Ещё нет аккаунта? "}
            <button
              className="link-btn"
              onClick={() => {
                setMode(isReg ? "login" : "register");
                setErr("");
              }}
            >
              {isReg ? "Войти" : "Зарегистрироваться"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-box">
        <Icon
          n={icon}
          style={{ width: 18, height: 18 }}
          className="field-ico"
        />
        {children}
      </div>
    </label>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.8 6.6 2.8 11.7S6.9 21 12 21c5.3 0 8.8-3.7 8.8-9 0-.6-.06-1-.15-1.5H12z"
      />
    </svg>
  );
}

Object.assign(window, { Auth });
