import Link from "next/link";
import { getCurrentUser } from "../lib/auth.js";
import HomeHeader from "../components/HomeHeader.js";
import HomeCarousel from "../components/HomeCarousel.js";
import HomeAuth from "../components/HomeAuth.js";
import CountdownTimer from "../components/CountdownTimer.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FALLBACK_EXAM_DATE = "2026-11-01";

function getExamInfo() {
  const raw = process.env.EXAM_DATE || FALLBACK_EXAM_DATE;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  let iso = FALLBACK_EXAM_DATE;

  if (match) {
    const [year, month, day] = raw.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      iso = raw;
    }
  }

  const [year, month, day] = iso.split("-").map(Number);
  return {
    iso,
    label: `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`,
    targetIso: `${iso}T00:00:00+05:30`,
  };
}

export default async function Home() {
  const user = await getCurrentUser();
  const exam = getExamInfo();

  return (
    <div className="home-page">
      <HomeHeader user={user} />

      <main className="home-wrap">
        <section className="countdown-bar" aria-label="Exam countdown">
          <div className="countdown-copy">
            <span className="countdown-kicker">SEA &rarr; AE 2026</span>
            <h2>Exam on {exam.label}</h2>
            <p>Timings in IST</p>
          </div>

          <CountdownTimer targetIso={exam.targetIso} />

          <div className="countdown-cta">
            <span>{user ? "Keep the momentum going" : "Start with a free sample paper"}</span>
            <Link href={user ? "/exams" : "/register"}>
              {user ? "Continue prep" : "Start free"} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>

        <div className="home-hero-grid">
          <HomeCarousel loggedIn={Boolean(user)} />
          <HomeAuth user={user ? { name: user.name, plan: user.plan } : null} />
        </div>
      </main>
    </div>
  );
}
