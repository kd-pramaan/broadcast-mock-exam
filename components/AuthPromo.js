export default function AuthPromo({ mode }) {
  const isRegister = mode === "register";

  return (
    <aside className="auth-promo">
      <div className="auth-promo-rings" aria-hidden="true"></div>
      <span className="auth-promo-kicker">SEA &rarr; AE 2026</span>
      <h1>{isRegister ? "One exam. One shot. Be ready." : "Pick up where you left off."}</h1>
      <p>
        {isRegister
          ? "Full-length mock exams built for All India Radio engineers - real CBT pattern, instant feedback and focused practice for the final stretch."
          : "Your scores, attempts and leaderboard rank are waiting. Log in and keep your preparation moving."}
      </p>

      <ul className="auth-promo-list">
        <li>All 4 papers + 200-Q full mock</li>
        <li>Real CBT timer &amp; instant scorecards</li>
        <li>Detailed answer explanations</li>
        <li>Free sample paper included</li>
      </ul>

      <div className="auth-promo-stats">
        <div><b>4</b><span>papers</span></div>
        <div><b>200</b><span>questions</span></div>
        <div><b>₹199</b><span>one-time</span></div>
      </div>

      <div className="auth-promo-foot">
        <span className="auth-promo-dot"></span>
        Start free &middot; no payment needed
      </div>
    </aside>
  );
}
