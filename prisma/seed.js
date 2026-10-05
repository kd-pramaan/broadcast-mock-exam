import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const exists = await prisma.exam.findFirst({ where: { title: "Broadcast Engineering Basics" } });
  if (!exists) {
    await prisma.exam.create({
      data: {
        title: "Broadcast Engineering Basics",
        description: "Sample mock exam covering transmission and signal fundamentals. Replace with real questions.",
        durationMinutes: 20,
        totalMarks: 6,
        isPublished: true,
        isFree: true, // the one free paper Basic-plan users get today
        questions: [
          { id: "q1", text: "Which frequency range is used for FM radio broadcasting?", options: ["3-30 kHz", "88-108 MHz", "300-3000 MHz", "1-2 GHz"], correctIndex: 1, marks: 2 },
          { id: "q2", text: "What does SNR stand for?", options: ["Signal-to-Noise Ratio", "Satellite Network Relay", "Studio Network Router", "Signal Network Reach"], correctIndex: 0, marks: 2 },
          { id: "q3", text: "Which modulation scheme does ATSC digital TV broadcasting use?", options: ["AM", "FM", "8-VSB", "QPSK only"], correctIndex: 2, marks: 2 },
        ],
      },
    });
  }

  console.log(`Seeded admin account: ${adminEmail} / ${adminPassword}`);
  console.log("Seeded 1 sample exam: Broadcast Engineering Basics");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
