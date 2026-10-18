import { test } from "node:test";
import assert from "node:assert/strict";
import { getScoreBreakdown, scoreAttempt, scoreFullExam } from "../lib/scoring.js";

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

test("wrong answers lose a quarter of that question's marks, skipped ones don't", () => {
  // q1 correct (+2), q2 wrong (-0.75), q3 skipped (0)
  assert.equal(scoreAttempt(questions, { q1: 1, q2: 1 }), 1.25);
  assert.deepEqual(getScoreBreakdown(questions, { q1: 1, q2: 1 }), {
    correctCount: 1,
    wrongCount: 1,
    skippedCount: 1,
    marksEarned: 2,
    penalty: 0.75,
    score: 1.25,
  });
});

test("negative marking can take the score below zero", () => {
  // all three wrong: -0.5 -0.75 -1.25
  assert.equal(scoreAttempt(questions, { q1: 0, q2: 1, q3: 0 }), -2.5);
});

test("ignores unknown question ids in the answer payload", () => {
  assert.equal(scoreAttempt(questions, { q1: 1, bogus: 0 }), 2);
});

test("scores a full exam paper by paper", () => {
  const papers = [
    { key: "p1", title: "Paper 1", questions: [
      { id: "a1", correctIndex: 0, marks: 2 },
      { id: "a2", correctIndex: 1, marks: 2 },
    ] },
    { key: "p2", title: "Paper 2", questions: [
      { id: "b1", correctIndex: 0, marks: 4 },
    ] },
  ];
  const result = scoreFullExam(papers, { a1: 0, a2: 0, b1: 1 });
  assert.equal(result.score, 2 - 0.5 - 1); // a1 +2, a2 -0.5, b1 -1
  assert.equal(result.totalMarks, 8);
  assert.equal(result.paperResults.length, 2);
  assert.equal(result.paperResults[0].correctCount, 1);
});
