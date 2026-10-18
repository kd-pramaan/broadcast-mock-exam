import Link from "next/link";

export default function UpgradeBanner() {
  return (
    <div className="upgrade-banner">
      <div>
        <h2>Want to see what you got wrong?</h2>
        <p>
          Unlock the full review — correct options in green, wrong ones in red, and a clear
          explanation under every question — so you stop repeating the same mistakes.
        </p>
        <ul>
          <li>Every correct option highlighted, with step-by-step explanations</li>
          <li>All papers and full-length mock exams, not just the free sample</li>
          <li>One-time payment, no subscription</li>
        </ul>
      </div>
      <div className="upgrade-banner-cta">
        <span className="upgrade-price">Just ₹199</span>
        <Link className="btn upgrade-btn" href="/pay">Upgrade now</Link>
      </div>
    </div>
  );
}
