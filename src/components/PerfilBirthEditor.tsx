"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BirthForm, type BirthFormValues } from "./BirthForm";

export function PerfilBirthEditor({ initial }: { initial?: Partial<BirthFormValues> }) {
  const router = useRouter();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(values: BirthFormValues) {
    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      return data.error ?? "Não deu pra salvar.";
    }
    setSavedAt(Date.now());
    router.refresh();
  }

  return (
    <div>
      <BirthForm initial={initial} submitLabel="Salvar dados de nascimento" onSubmit={handleSubmit} />
      {savedAt && <p className="text-sm text-good mt-3">Mapa recalculado com os novos dados.</p>}
    </div>
  );
}
