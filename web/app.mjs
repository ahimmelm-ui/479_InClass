import { STORAGE_KEY, dailyQuestion, easternDay, parseHistory, recordAnswer, statistics } from "./game.mjs";

const get = (id) => document.getElementById(id);
let bank;
let day;
let history = [];
let storageWorks = true;

function readHistory() {
  try {
    history = parseHistory(localStorage.getItem(STORAGE_KEY));
    storageWorks = true;
    get("status").textContent = "";
  } catch {
    storageWorks = false;
    get("status").textContent = "Browser storage is unavailable or unreadable. You can play, but answers may not be saved. Existing stored data will not be overwritten.";
  }
}

function render() {
  day = easternDay();
  const saved = history.find((a) => a.day === day);
  const question = dailyQuestion(bank, day);
  get("game").hidden = false;
  get("category").textContent = saved ? "Completed" : question.category;
  get("day").dateTime = day;
  get("day").textContent = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
  get("question-title").textContent = saved ? saved.prompt : question.prompt;
  get("choices").replaceChildren();
  const legend = document.createElement("legend");
  legend.textContent = saved ? "You have answered today’s question" : "Pick your answer";
  get("choices").append(legend);
  (saved ? saved.options : question.options).forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "option";
    const radio = document.createElement("input");
    Object.assign(radio, { type: "radio", name: "answer", value: index, required: true, disabled: Boolean(saved), checked: saved?.selected === index });
    const text = document.createElement("span");
    text.textContent = option;
    label.append(radio, text);
    get("choices").append(label);
  });
  get("submit").hidden = Boolean(saved);
  get("result").hidden = !saved;
  if (saved) {
    get("result").textContent = `${saved.selected === saved.correctIndex ? "Correct! +1 point." : "Not quite this time."} Correct answer: ${saved.options[saved.correctIndex]}. ${saved.explanation}`;
  }
  const stats = statistics(history);
  get("stats").textContent = `${stats.correct} points · ${stats.total} answered · ${stats.accuracy}% accuracy`;
  get("history-list").replaceChildren();
  [...history].sort((a, b) => b.day.localeCompare(a.day)).forEach((a) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${a.day} · ${a.selected === a.correctIndex ? "Correct" : "Incorrect"}`;
    const detail = document.createElement("p");
    detail.textContent = `${a.prompt} Your answer: ${a.options[a.selected]}. Correct answer: ${a.options[a.correctIndex]}. ${a.explanation}`;
    item.append(title, detail);
    get("history-list").append(item);
  });
}

get("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (easternDay() !== day) {
    render();
    get("status").textContent = "A new day has started. Please answer the new question.";
    return;
  }
  const choice = new FormData(event.currentTarget).get("answer");
  if (choice === null) return;
  if (storageWorks) readHistory();
  history = recordAnswer(history, dailyQuestion(bank, day), day, Number(choice));
  if (storageWorks) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
    catch {
      storageWorks = false;
      get("status").textContent = "Your answer counts in this session, but browser storage could not save it.";
    }
  }
  render();
});

async function start() {
  try {
    const response = await fetch("./questions.json");
    if (!response.ok) throw new Error("Question request failed.");
    bank = await response.json();
    readHistory();
    render();
    setInterval(() => { if (easternDay() !== day) render(); }, 15000);
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY || event.key === null) { readHistory(); render(); }
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) { if (storageWorks) readHistory(); render(); }
    });
  } catch {
    get("game").hidden = true;
    get("status").textContent = "Could not load today’s question. Check your connection and reload the page.";
  }
}

start();
