// Helpers shared by the exam pages and API routes for the two exam shapes:
//  - "short": one subject, questions stored directly on the Exam.
//  - "full":  several papers; some papers share a `group` (e.g. Paper 2 radio/tv)
//             and the candidate picks one stream before starting.

// Strip the answer key / explanation so the browser never receives it.
export function stripQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map(({ id, text, options }) => ({ id, text, options }));
}

// Whether the exam's paper list requires a stream choice up front.
export function requiresPaperChoice(papers) {
  return Array.isArray(papers) && papers.some((p) => p && p.group);
}

// Return the papers the candidate will actually sit, in order.
export function selectPapers(papers, choice) {
  if (!Array.isArray(papers)) return [];
  return papers.filter((p) => !p || !p.group || p.selector === choice);
}

// First paper of each group + all ungrouped papers, in order - used to derive
// the exam-level total marks / total duration for display.
export function summarizePapers(papers) {
  if (!Array.isArray(papers)) return { totalMarks: 0, durationMinutes: 0 };
  const seenGroups = new Set();
  let totalMarks = 0;
  let durationMinutes = 0;
  for (const p of papers) {
    if (!p) continue;
    if (p.group) {
      if (seenGroups.has(p.group)) continue;
      seenGroups.add(p.group);
    }
    totalMarks += (p.questions || []).reduce((s, q) => s + (q.marks || 0), 0);
    durationMinutes += p.durationMinutes || 0;
  }
  return { totalMarks, durationMinutes };
}

// Flatten all questions across every paper (used for validation / counting).
export function allPaperQuestions(papers) {
  if (!Array.isArray(papers)) return [];
  return papers.flatMap((p) => (p && Array.isArray(p.questions) ? p.questions : []));
}
