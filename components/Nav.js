"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav({ isAdmin, crumbs }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="page-header">
      <nav>
        <Link href="/dashboard" className="brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <path d="M7 12.5l3 3 7-7" stroke="#1b2140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          MarQ
        </Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/exams">Exams</Link>
        <Link href="/profile">Profile</Link>
        {isAdmin && <Link href="/admin">Admin</Link>}
        <button className="btn secondary" style={{ marginLeft: "auto" }} onClick={logout}>
          Log out
        </button>
      </nav>
      {crumbs && crumbs.length > 0 && (
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          {crumbs.map((c, i) => (
            <span className="crumb" key={i}>
              <span className="sep">/</span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="current">{c.label}</span>}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
