/* ============ Seed data + helpers ============ */
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const uid = () => "t" + Math.random().toString(36).slice(2, 9);

const SEED = [
  {
    id: "t1",
    title: "Завершить редизайн дашборда",
    cat: "work",
    prio: "high",
    date: todayISO(),
    time: "10:00",
    notes:
      "Финализировать тёмную тему, прогресс-кольца и недельный график. Проверить адаптив на мобильных.",
    done: false,
    starred: true,
    subs: [
      { id: "s1", t: "Собрать палитру токенов", done: true },
      { id: "s2", t: "Свёрстать карточки статистики", done: true },
      { id: "s3", t: "Анимация прогресс-кольца", done: false },
      { id: "s4", t: "Проверить мобильную сетку", done: false },
    ],
  },
  {
    id: "t2",
    title: "Утренняя пробежка 5 км",
    cat: "health",
    prio: "med",
    date: todayISO(),
    time: "07:00",
    notes: "Парк, лёгкий темп. Размяться перед стартом.",
    done: true,
    starred: false,
    subs: [
      { id: "s5", t: "Разминка 10 мин", done: true },
      { id: "s6", t: "Пробежка", done: true },
    ],
  },
  {
    id: "t3",
    title: "Прочитать главу «Atomic Habits»",
    cat: "learning",
    prio: "low",
    date: todayISO(),
    time: "21:00",
    notes: "Глава про окружение и привычки. Сделать заметки.",
    done: false,
    starred: false,
    subs: [],
  },
  {
    id: "t4",
    title: "Оплатить счета за квартиру",
    cat: "home",
    prio: "high",
    date: todayISO(),
    time: "18:00",
    notes: "Электричество, интернет, вода.",
    done: false,
    starred: false,
    subs: [
      { id: "s7", t: "Электричество", done: false },
      { id: "s8", t: "Интернет", done: false },
      { id: "s9", t: "Вода", done: false },
    ],
  },
  {
    id: "t5",
    title: "Созвон с ментором по карьере",
    cat: "work",
    prio: "med",
    date: addDays(1),
    time: "15:30",
    notes: "Обсудить план развития на квартал и обратную связь.",
    done: false,
    starred: true,
    subs: [],
  },
  {
    id: "t6",
    title: "Купить продукты на неделю",
    cat: "home",
    prio: "low",
    date: addDays(1),
    time: "12:00",
    notes: "Овощи, крупы, кофе, фрукты.",
    done: false,
    starred: false,
    subs: [
      { id: "s10", t: "Список покупок", done: true },
      { id: "s11", t: "Заказать доставку", done: false },
    ],
  },
  {
    id: "t7",
    title: "Медитация перед сном",
    cat: "health",
    prio: "low",
    date: addDays(1),
    time: "22:30",
    notes: "10 минут дыхательной практики.",
    done: false,
    starred: false,
    subs: [],
  },
  {
    id: "t8",
    title: "Подготовить портфолио проектов",
    cat: "work",
    prio: "high",
    date: addDays(2),
    time: "11:00",
    notes: "Собрать 3 кейса, описать процесс и результат.",
    done: false,
    starred: false,
    subs: [
      { id: "s12", t: "Выбрать проекты", done: false },
      { id: "s13", t: "Написать описания", done: false },
      { id: "s14", t: "Подобрать визуалы", done: false },
    ],
  },
  {
    id: "t9",
    title: "Урок французского на Duolingo",
    cat: "learning",
    prio: "low",
    date: addDays(2),
    time: "20:00",
    notes: "Поддержать streak. Тема: путешествия.",
    done: false,
    starred: false,
    subs: [],
  },
  {
    id: "t10",
    title: "Разобрать рабочую почту",
    cat: "work",
    prio: "med",
    date: addDays(-1),
    time: "09:00",
    notes: "Inbox zero. Ответить на важные письма.",
    done: true,
    starred: false,
    subs: [],
  },
];

/* weekly completed count for chart */
const WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEK_DATA = [5, 8, 6, 11, 16, 9, 12];

function loadTasks() {
  try {
    const r = localStorage.getItem("tk_tasks_v1");
    if (r) return JSON.parse(r);
  } catch (e) {}
  return SEED;
}
function saveTasks(t) {
  try {
    localStorage.setItem("tk_tasks_v1", JSON.stringify(t));
  } catch (e) {}
}

Object.assign(window, {
  SEED,
  WEEK_LABELS,
  WEEK_DATA,
  loadTasks,
  saveTasks,
  uid,
  todayISO,
  addDays,
  CATS,
});
