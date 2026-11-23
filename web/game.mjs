// Pure rules shared by the browser and Node's built-in test runner.
export const STORAGE_KEY = "daily-dev-trivia:v1";

export function easternDay(instant = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(instant);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dailyQuestion(bank, day) {
  if (!bank.length) throw new Error("The question bank is empty.");
  const offset = Math.round((Date.parse(`${day}T00:00:00Z`) - Date.UTC(2026, 0, 1)) / 86400000);
  return bank[((offset % bank.length) + bank.length) % bank.length];
}

function validAttempt(a) {
  return a && /^\d{4}-\d{2}-\d{2}$/.test(a.day)
    && typeof a.prompt === "string" && typeof a.explanation === "string" && typeof a.questionId === "string"
    && Array.isArray(a.options) && a.options.length === 4 && a.options.every((o) => typeof o === "string")
    && Number.isInteger(a.selected) && a.selected >= 0 && a.selected < 4
    && Number.isInteger(a.correctIndex) && a.correctIndex >= 0 && a.correctIndex < 4;
}

export function parseHistory(raw) {
  if (raw === null) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(validAttempt)
      || new Set(value.map((a) => a.day)).size !== value.length) throw new Error("Invalid history.");
  return value;
}

export function recordAnswer(history, question, day, selected) {
  if (history.some((a) => a.day === day)) return history;
  if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
    throw new Error("Choose one of the four answers.");
  }
  return [...history, {
    day, questionId: question.id, prompt: question.prompt, options: [...question.options],
    selected, correctIndex: question.correct_index, explanation: question.explanation,
  }];
}

export function statistics(history) {
  const correct = history.filter((a) => a.selected === a.correctIndex).length;
  return { total: history.length, correct, accuracy: history.length ? Math.round(correct / history.length * 100) : 0 };
}
