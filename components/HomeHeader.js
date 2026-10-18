import Link from "next/link";

export default function HomeHeader({ user }) {
  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-brand" aria-label="MarQ home">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <path d="M7 12.5l3 3 7-7" stroke="#1b2140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>MarQ</span>
        </Link>

        <nav className="home-nav" aria-label="Main navigation">
          <Link href="/exams">Mock exams</Link>
          <Link href="/contact">Contact</Link>
          {user ? (
            <Link href="/dashboard" className="home-nav-cta">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="home-nav-login">Log in</Link>
              <Link href="/register" className="home-nav-cta">Register free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
