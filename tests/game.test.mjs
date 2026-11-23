import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dailyQuestion, easternDay, parseHistory, recordAnswer, statistics } from "../web/game.mjs";

const bank = JSON.parse(readFileSync(new URL("../web/questions.json", import.meta.url)));

test("Eastern midnight changes the question date in winter and summer", () => {
  for (const [before, after, previous, next] of [
    ["2026-01-02T04:59:59Z", "2026-01-02T05:00:00Z", "2026-01-01", "2026-01-02"],
    ["2026-07-02T03:59:59Z", "2026-07-02T04:00:00Z", "2026-07-01", "2026-07-02"],
    ["2026-03-08T06:59:59Z", "2026-03-08T07:00:00Z", "2026-03-08", "2026-03-08"],
    ["2026-11-01T05:59:59Z", "2026-11-01T06:00:00Z", "2026-11-01", "2026-11-01"],
  ]) {
    assert.equal(easternDay(new Date(before)), previous);
    assert.equal(easternDay(new Date(after)), next);
  }
});

test("every question appears before rotation repeats", () => {
  const ids = Array.from({ length: 30 }, (_, index) => dailyQuestion(bank, `2026-01-${String(index + 1).padStart(2, "0")}`).id);
  assert.equal(new Set(ids).size, 30);
  assert.equal(dailyQuestion(bank, "2026-01-31").id, ids[0]);
});

test("one daily attempt survives serialization and cannot be replaced", () => {
  const q = bank[0];
  const saved = recordAnswer([], q, "2026-01-01", q.correct_index);
  const reloaded = parseHistory(JSON.stringify(saved));
  assert.deepEqual(recordAnswer(reloaded, q, "2026-01-01", 3), saved);
  assert.deepEqual(statistics(reloaded), { total: 1, correct: 1, accuracy: 100 });
});

test("incorrect answers score zero and history is independent of bank edits", () => {
  const q = structuredClone(bank[0]);
  const saved = recordAnswer([], q, "2026-01-01", (q.correct_index + 1) % 4);
  q.options[0] = "Edited later";
  assert.notEqual(saved[0].options[0], q.options[0]);
  assert.deepEqual(statistics(saved), { total: 1, correct: 0, accuracy: 0 });
});

test("invalid choices and corrupted history are rejected", () => {
  for (const value of [-1, 4, 0.5, NaN]) assert.throws(() => recordAnswer([], bank[0], "2026-01-01", value));
  for (const raw of ["broken", "{}", "[null]", '[{"day":"2026-01-01"}]']) assert.throws(() => parseHistory(raw));
  assert.deepEqual(parseHistory(null), []);
});
