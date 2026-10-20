"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function linkClass(href, extra = "") {
    return `${extra} ${isActive(pathname, href) ? "active" : ""}`.trim();
  }

  return (
    <header className="site-header" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="MarQ home">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <path d="M7 12.5l3 3 7-7" stroke="#1b2140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>MarQ</span>
        </Link>

        <button
          type="button"
          className="site-menu-btn"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div
          id="site-nav"
          className={`site-nav ${open ? "open" : ""}`}
          role="navigation"
          aria-label="Main navigation"
          onClick={(event) => {
            if (event.target.closest && event.target.closest("a")) setOpen(false);
          }}
        >
          {user ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")} aria-current={isActive(pathname, "/dashboard") ? "page" : undefined}>
                Dashboard
              </Link>
              <Link href="/exams" className={linkClass("/exams")} aria-current={isActive(pathname, "/exams") ? "page" : undefined}>
                Exams
              </Link>
              <Link href="/profile" className={linkClass("/profile")} aria-current={isActive(pathname, "/profile") ? "page" : undefined}>
                Profile
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className={linkClass("/admin")} aria-current={isActive(pathname, "/admin") ? "page" : undefined}>
                  Admin
                </Link>
              )}
              <Link href="/contact" className={linkClass("/contact")} aria-current={isActive(pathname, "/contact") ? "page" : undefined}>
                Contact
              </Link>
              <button type="button" className="site-nav-logout" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/exams" className={linkClass("/exams")} aria-current={isActive(pathname, "/exams") ? "page" : undefined}>
                Mock exams
              </Link>
              <Link href="/contact" className={linkClass("/contact")} aria-current={isActive(pathname, "/contact") ? "page" : undefined}>
                Contact
              </Link>
              <Link href="/login" className={linkClass("/login", "site-nav-login")} aria-current={isActive(pathname, "/login") ? "page" : undefined}>
                Log in
              </Link>
              <Link href="/register" className={linkClass("/register", "site-nav-cta")} aria-current={isActive(pathname, "/register") ? "page" : undefined}>
                Register free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
