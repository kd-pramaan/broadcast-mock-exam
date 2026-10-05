"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivateButton({ userId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function activate() {
    setLoading(true);
    await fetch(`/api/admin/activate/${userId}`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn" disabled={loading} onClick={activate}>
      {loading ? "..." : "Approve"}
    </button>
  );
}
