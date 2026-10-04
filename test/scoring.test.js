import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAttempt } from "../lib/scoring.js";

const questions = [
  { id: "q1", correctIndex: 1, marks: 2 },
  { id: "q2", correctIndex: 0, marks: 3 },
  { id: "q3", correctIndex: 2, marks: 5 },
];

test("full marks for all-correct answers", () => {
  assert.equal(scoreAttempt(questions, { q1: 1, q2: 0, q3: 2 }), 10);
});

test("zero for no answers submitted", () => {
  assert.equal(scoreAttempt(questions, {}), 0);
  assert.equal(scoreAttempt(questions, undefined), 0);
});

test("only correct answers count, wrong/missing ones don't", () => {
  assert.equal(scoreAttempt(questions, { q1: 1, q2: 1, q3: 0 }), 2);
});

test("ignores unknown question ids in the answer payload", () => {
  assert.equal(scoreAttempt(questions, { q1: 1, bogus: 0 }), 2);
});
