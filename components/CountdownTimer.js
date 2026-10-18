"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
];

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function CountdownTimer({ targetIso }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) return;

    function update() {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        minutes: Math.floor(diff / 60000) % 60,
        seconds: Math.floor(diff / 1000) % 60,
      });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <div className="countdown-timer" role="timer" aria-label="Time left until the exam">
      {UNITS.map(([key, label]) => (
        <div className="countdown-unit" key={key}>
          <b>{remaining ? pad(remaining[key]) : "--"}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
