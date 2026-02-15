"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // important: on gère nous-mêmes la navigation
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/"); // ou /dashboard
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-8">
        <input
          className="input-underline"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-underline"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col space-y-3 pt-6">
          <button className="btn-primary" disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </button>

          <Link href="/register" className="btn-secondary text-center block">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
