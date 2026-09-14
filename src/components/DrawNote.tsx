"use client";

import { useState } from "react";

export function DrawNote({ drawId, initialNote }: { drawId: string; initialNote: string | null }) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/tarot/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId, note }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anote o que essa tiragem significou pra você…"
        rows={2}
        maxLength={500}
        className="w-full rounded-lg bg-surface-2 border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent transition-colors resize-none"
      />
      <div className="flex items-center gap-3 mt-1.5">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs rounded-full border border-line px-3 py-1 hover:border-accent transition-colors disabled:opacity-50"
        >
          {saving ? "salvando…" : "salvar nota"}
        </button>
        {saved && <span className="text-xs text-good">salvo</span>}
      </div>
    </div>
  );
}
