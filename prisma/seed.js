import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

function loadQuestions(file) {
  const full = path.join(process.cwd(), "exam-data", file);
  return JSON.parse(readFileSync(full, "utf8"));
}

async function createShortExam({ title, description, tags, durationMinutes, isFree, file }) {
  const exists = await prisma.exam.findFirst({ where: { title } });
  if (exists) return exists;
  const questions = loadQuestions(file);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  return prisma.exam.create({
    data: { title, description, tags, type: "short", durationMinutes, totalMarks, questions, isPublished: true, isFree },
  });
}

async function createFullExam() {
  const title = "SEA to AE 2026 - Full Mock (3 Papers)";
  const exists = await prisma.exam.findFirst({ where: { title } });
  if (exists) return exists;

  const broadcast = loadQuestions("Paper_1_Broadcast_Engineering.json");
  const radio = loadQuestions("Paper_2A_Radio_Engineering.json");
  const tv = loadQuestions("Paper_2B_Television_Engineering.json");
  const general = loadQuestions("Paper_3_General_Subjects.json");

  const papers = [
    { key: "paper1", title: "Paper 1: Broadcast Engineering", durationMinutes: 60, questions: broadcast },
    { key: "paper2a", group: "paper2", selector: "radio", title: "Paper 2 (A): Radio Engineering", durationMinutes: 60, questions: radio },
    { key: "paper2b", group: "paper2", selector: "tv", title: "Paper 2 (B): Television Engineering", durationMinutes: 60, questions: tv },
    { key: "paper3", title: "Paper 3: General Subjects", durationMinutes: 60, questions: general },
  ];

  // paper1 + one paper2 variant + paper3
  const totalMarks =
    broadcast.reduce((s, q) => s + q.marks, 0) +
    radio.reduce((s, q) => s + q.marks, 0) +
    general.reduce((s, q) => s + q.marks, 0);
  const durationMinutes = 60 * 3;

  return prisma.exam.create({
    data: {
      title,
      description: "Three-paper CBT mock: Broadcast Engineering, your choice of Radio or Television Engineering, then General Subjects.",
      tags: ["Full-length CBT mocks", "SEA-AE"],
      type: "full",
      durationMinutes,
      questions: [],
      papers,
      totalMarks,
      isPublished: true,
      isFree: false,
    },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      age: 30,
      region: "North",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      status: "active",
      plan: "paid",
      isAdmin: true,
    },
  });

  const sampleExists = await prisma.exam.findFirst({ where: { title: "Broadcast Engineering Basics" } });
  if (!sampleExists) {
    await prisma.exam.create({
      data: {
        title: "Broadcast Engineering Basics",
        description: "Sample mock exam covering transmission and signal fundamentals. Replace with real questions.",
        type: "short",
        durationMinutes: 20,
        totalMarks: 6,
        isPublished: true,
        isFree: true, // the one free paper Basic-plan users get today
        questions: [
          { id: "q1", topic: "Broadcast Engineering", text: "Which frequency range is used for FM radio broadcasting?", options: ["3-30 kHz", "88-108 MHz", "300-3000 MHz", "1-2 GHz"], correctIndex: 1, marks: 2, explanation: "FM broadcast radio is assigned to the 88-108 MHz VHF band." },
          { id: "q2", topic: "Signal Fundamentals", text: "What does SNR stand for?", options: ["Signal-to-Noise Ratio", "Satellite Network Relay", "Studio Network Router", "Signal Network Reach"], correctIndex: 0, marks: 2, explanation: "SNR measures signal quality relative to background noise." },
          { id: "q3", topic: "Digital TV", text: "Which modulation scheme does ATSC digital TV broadcasting use?", options: ["AM", "FM", "8-VSB", "QPSK only"], correctIndex: 2, marks: 2, explanation: "ATSC uses 8-VSB for terrestrial digital over-the-air transmission." },
        ],
      },
    });
  }

  await createShortExam({
    title: "Broadcast Engineering",
    description: "Single-subject practice paper covering broadcast engineering topics.",
    tags: ["Broadcast Engineering", "Paper 1"],
    durationMinutes: 60,
    isFree: false,
    file: "Paper_1_Broadcast_Engineering.json",
  });
  await createShortExam({
    title: "Radio Engineering",
    description: "Single-subject practice paper covering radio engineering topics.",
    tags: ["Radio Engineering", "Paper 2A"],
    durationMinutes: 60,
    isFree: false,
    file: "Paper_2A_Radio_Engineering.json",
  });
  await createShortExam({
    title: "Television Engineering",
    description: "Single-subject practice paper covering television engineering topics.",
    tags: ["Television Engineering", "Paper 2B"],
    durationMinutes: 60,
    isFree: false,
    file: "Paper_2B_Television_Engineering.json",
  });
  await createShortExam({
    title: "General Subjects",
    description: "Single-subject practice paper covering general subjects.",
    tags: ["General Subjects", "Paper 3"],
    durationMinutes: 60,
    isFree: false,
    file: "Paper_3_General_Subjects.json",
  });

  await createFullExam();

  console.log(`Seeded admin account: ${adminEmail} / ${adminPassword}`);
  console.log("Seeded sample + 4 subject exams + 1 full 3-paper exam");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
