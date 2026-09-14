"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg bg-surface-2 border border-line px-3 py-2.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent transition-colors";

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não deu pra entrar.");
        return;
      }
      router.push(searchParams.get("next") ?? "/app");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display font-bold text-lg block mb-8">
          Órbita
        </Link>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h1 className="text-2xl font-bold mb-1">Entrar</h1>
          <div>
            <label className="block text-sm text-ink-muted mb-1.5" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-ink-muted mb-1.5" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
          <p className="text-sm text-ink-dim text-center">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="text-accent">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
