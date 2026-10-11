import { readFileSync, mkdirSync, writeFileSync } from 'fs';

const htmlPath = 'd:/air-sudha/SudhaElectronics/SEA_AE_2026_TCS_eZone_Style_3_Paper_CBT-3.html';
const outPath = 'd:/air-sudha/bce/exam-data/sea-ae-2026-tcs-ezone-style-3-paper-cbt-3.json';

const html = readFileSync(htmlPath, 'utf8');

const bankMatch = html.match(/const\s+BANK\s*=\s*\{([\s\S]*?)\}\s*;\s*const\s+META\s*=/);
if (!bankMatch) {
  throw new Error('BANK object not found in the HTML.');
}

const metaMatch = html.match(/const\s+META\s*=\s*\{([\s\S]*?)\}\s*;\s*let\s+stream/);
if (!metaMatch) {
  throw new Error('META object not found in the HTML.');
}

const bank = Function('return ({' + bankMatch[1] + '});')();
const meta = Function('return ({' + metaMatch[1] + '});')();

const papers = Object.entries(bank).map(([key, questions]) => ({
  key,
  title: meta[key] || key,
  durationMinutes: 60,
  totalMarks: questions.length * 2,
  questions: questions.map((q, index) => ({
    id: `${key}-${index + 1}`,
    topic: q.topic,
    text: q.q,
    options: q.o.split('|'),
    correctIndex: q.a,
    marks: 2,
    explanation: q.e,
  })),
}));

const questions = papers.flatMap((paper) =>
  paper.questions.map((q) => ({
    ...q,
    topic: q.topic,
    explanation: q.explanation,
    paperKey: paper.key,
    paperTitle: paper.title,
  }))
);

mkdirSync('d:/air-sudha/bce/exam-data', { recursive: true });
writeFileSync(outPath, JSON.stringify(questions, null, 2));

console.log(`Extracted ${questions.length} questions to ${outPath}`);
