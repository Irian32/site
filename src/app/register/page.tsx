"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Registration failed");
        return;
      }

      // ✅ succès -> retour login
      router.push("/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-8">
        <input className="input-underline" placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input className="input-underline" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-underline" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="input-underline" type="password" placeholder="confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col space-y-3 pt-6">
          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          <Link href="/login" className="btn-secondary text-center block">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
