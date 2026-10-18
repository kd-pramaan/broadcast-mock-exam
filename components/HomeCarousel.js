"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function ExamArt() {
  return (
    <div className="slide-art" aria-hidden="true">
      <div className="art-exam">
        <div className="art-exam-top">
          <span className="art-brand"><i></i> xtraMarQ</span>
          <span className="art-timer">&#9201; 59:42</span>
        </div>
        <div className="art-exam-body">
          <div className="art-meta">
            <span className="art-chip">Review &middot; Paper 1</span>
            <span className="art-chip art-chip-green">Correct 32</span>
          </div>
          <p className="art-q">A circulator is generally a:</p>
          <div className="art-opt art-opt-correct">
            <span>three-port non-reciprocal device</span>
            <b>Correct</b>
          </div>
          <div className="art-opt art-opt-wrong">
            <span>two-terminal filter</span>
            <b>Yours</b>
          </div>
          <div className="art-opt"><span>four-port reciprocal attenuator</span></div>
          <div className="art-explain">
            <b>Explanation:</b> A circulator routes power from one port to the next in one direction.
          </div>
          <div className="art-score">
            <span>Score <b>148 / 200</b></span>
            <span>Rank <b>#7</b></span>
          </div>
        </div>
      </div>
      <div className="art-float art-float-gold">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M12 13v5M8.5 20h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All India rank
      </div>
    </div>
  );
}

function FreeArt() {
  return (
    <div className="slide-art" aria-hidden="true">
      <div className="art-free">
        <div className="art-free-head">
          <span>Free access</span>
          <span className="art-free-dot"></span>
        </div>
        <div className="art-free-price">₹0</div>
        <p className="art-free-copy">No payment. No card. Just practice.</p>
        <ul>
          <li>Full sample paper</li>
          <li>Real exam timer</li>
          <li>Instant score + rank</li>
        </ul>
      </div>
      <div className="art-float art-float-green">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M3 6.5h18V10H3V6.5ZM12 6.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        No payment needed
      </div>
    </div>
  );
}

function PaidArt() {
  return (
    <div className="slide-art" aria-hidden="true">
      <div className="art-paid">
        <div className="art-paid-tag">Full access</div>
        <div className="art-paid-price">₹199 <small>one-time</small></div>
        <ul>
          <li>All 4 papers</li>
          <li>200-Q full mock</li>
          <li>Answer explanations</li>
          <li>Unlimited attempts</li>
        </ul>
        <div className="art-paid-foot">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          No subscription
        </div>
      </div>
      <div className="art-float art-float-gold">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        4 papers &middot; 200 questions
      </div>
    </div>
  );
}

const SLIDES = [
  {
    key: "mocks",
    tone: "tone-navy",
    accent: "#ffb04a",
    eyebrow: "SEA → AE 2026",
    title: <>Walk in ready.<br />Walk out confident.</>,
    text: "Full-length CBT mocks in the real exam pattern, with a timer, instant scorecard and All India rank.",
    chips: ["4 papers", "200-Q full mock", "Real exam timer"],
    art: <ExamArt />,
  },
  {
    key: "free",
    tone: "tone-green",
    accent: "#49e3b0",
    eyebrow: "Free access",
    title: <>Your first paper<br />is on us.</>,
    text: "Try a full sample paper with the timer, instant score and leaderboard rank. No payment, no card.",
    chips: ["Sample paper", "Instant score", "Leaderboard"],
    art: <FreeArt />,
  },
  {
    key: "paid",
    tone: "tone-gold",
    accent: "#ffc94d",
    eyebrow: "Full access · ₹199",
    title: <>Every paper.<br />Every explanation.</>,
    text: "Unlock all 4 papers, the 200-question full mock, detailed answer explanations and unlimited attempts.",
    chips: ["All 4 papers", "Explanations", "Unlimited attempts"],
    art: <PaidArt />,
  },
];

export default function HomeCarousel({ loggedIn }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(id);
  }, [paused, index]);

  function go(direction) {
    setIndex((current) => (current + direction + SLIDES.length) % SLIDES.length);
  }

  function ctaFor(slide) {
    if (slide.key === "paid") {
      return loggedIn
        ? { href: "/pay", label: "Unlock full access" }
        : { href: "/register", label: "Register free" };
    }
    if (slide.key === "free") {
      return loggedIn
        ? { href: "/exams", label: "Open free paper" }
        : { href: "/register", label: "Start free" };
    }
    return loggedIn
      ? { href: "/exams", label: "Explore the papers" }
      : { href: "/register", label: "Start with a free paper" };
  }

  return (
    <section
      className="home-carousel"
      style={{ "--carousel-accent": SLIDES[index].accent }}
      aria-roledescription="carousel"
      aria-label="MarQ highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div className="carousel-viewport">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide, slideIndex) => {
            const cta = ctaFor(slide);
            const active = index === slideIndex;
            return (
              <article
                key={slide.key}
                className={`home-slide ${slide.tone}`}
                aria-hidden={!active}
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${SLIDES.length}`}
              >
                <div className="slide-copy">
                  <span className="slide-eyebrow">{slide.eyebrow}</span>
                  <h2>{slide.title}</h2>
                  <p>{slide.text}</p>
                  <div className="slide-chips">
                    {slide.chips.map((chip) => <span key={chip}>{chip}</span>)}
                  </div>
                  <Link className="home-cta" href={cta.href} tabIndex={active ? 0 : -1}>
                    {cta.label} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
                {slide.art}
              </article>
            );
          })}
        </div>
      </div>

      <button type="button" className="carousel-arrow carousel-prev" onClick={() => go(-1)} aria-label="Previous slide">
        &#8249;
      </button>
      <button type="button" className="carousel-arrow carousel-next" onClick={() => go(1)} aria-label="Next slide">
        &#8250;
      </button>

      <div className="carousel-footer">
        <div className="carousel-dots" role="tablist" aria-label="Choose slide">
          {SLIDES.map((slide, slideIndex) => (
            <button
              key={slide.key}
              type="button"
              role="tab"
              aria-selected={index === slideIndex}
              aria-label={`Show slide ${slideIndex + 1}`}
              className={index === slideIndex ? "active" : ""}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
        <span className="carousel-count">0{index + 1} / 0{SLIDES.length}</span>
      </div>
    </section>
  );
}
