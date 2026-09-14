"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BirthForm, type BirthFormValues } from "@/components/BirthForm";

const inputClass =
  "w-full rounded-lg bg-surface-2 border border-line px-3 py-2.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent transition-colors";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não deu pra criar sua conta.");
        return;
      }
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBirthSubmit(values: BirthFormValues) {
    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      return data.error ?? "Não deu pra calcular seu mapa.";
    }
    router.push("/app?bemvindo=1");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display font-bold text-lg block mb-8">
          Órbita
        </Link>

        <div className="flex items-center gap-2 mb-6 font-mono-label text-xs text-ink-dim">
          <span className={step === 1 ? "text-accent" : ""}>01 conta</span>
          <span>—</span>
          <span className={step === 2 ? "text-accent" : ""}>02 nascimento</span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleAccountSubmit} className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold mb-1">Criar sua conta</h1>
            <p className="text-sm text-ink-muted mb-2">
              Depois disso a gente já gera seu mapa astral de verdade.
            </p>
            <div>
              <label className="block text-sm text-ink-muted mb-1.5" htmlFor="displayName">
                Como podemos te chamar?
              </label>
              <input
                id="displayName"
                required
                className={inputClass}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome ou apelido"
              />
            </div>
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
                placeholder="voce@email.com"
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
                minLength={8}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 8 caracteres"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Criando…" : "Continuar"}
            </button>
            <p className="text-sm text-ink-dim text-center">
              Já tem conta?{" "}
              <Link href="/entrar" className="text-accent">
                Entrar
              </Link>
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold mb-1">Seus dados de nascimento</h1>
            <p className="text-sm text-ink-muted mb-2">
              Data, hora e cidade exatas geram um mapa muito mais preciso.
            </p>
            <BirthForm submitLabel="Gerar meu mapa" onSubmit={handleBirthSubmit} />
          </div>
        )}
      </div>
    </main>
  );
}
