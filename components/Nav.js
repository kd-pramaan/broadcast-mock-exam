"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav({ isAdmin }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/exams">Exams</Link>
      <Link href="/profile">Profile</Link>
      {isAdmin && <Link href="/admin">Admin</Link>}
      <button className="btn secondary" style={{ marginLeft: "auto" }} onClick={logout}>
        Log out
      </button>
    </nav>
  );
}
