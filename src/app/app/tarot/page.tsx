"use client";

import { useEffect, useState } from "react";

interface DrawnCard {
  id: number;
  name: string;
  suitLabel: string | null;
  upright: string;
  reversed: string;
  isReversed: boolean;
}

interface DrawResponse {
  id: string;
  spread: "single" | "three" | "celtic-cross";
  cards: DrawnCard[];
}

const POSITION_LABELS = ["Passado", "Presente", "Futuro"];

export default function TarotPage() {
  const [dailyDraw, setDailyDraw] = useState<DrawResponse | null | undefined>(undefined);
  const [threeDraw, setThreeDraw] = useState<DrawResponse | null>(null);
  const [drawingDaily, setDrawingDaily] = useState(false);
  const [drawingThree, setDrawingThree] = useState(false);

  useEffect(() => {
    fetch("/api/tarot/draw")
      .then((r) => r.json())
      .then((data) => setDailyDraw(data.draw ?? null))
      .catch(() => setDailyDraw(null));
  }, []);

  async function drawDaily() {
    setDrawingDaily(true);
    try {
      const res = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spread: "single" }),
      });
      const data = await res.json();
      setDailyDraw(data.draw);
    } finally {
      setDrawingDaily(false);
    }
  }

  async function drawThree() {
    setDrawingThree(true);
    try {
      const res = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spread: "three" }),
      });
      const data = await res.json();
      setThreeDraw(data.draw);
    } finally {
      setDrawingThree(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="font-mono-label text-xs text-ink-dim mb-3">tarot do dia</p>
        {dailyDraw === undefined && <p className="text-ink-muted">carregando…</p>}
        {dailyDraw === null && (
          <button
            onClick={drawDaily}
            disabled={drawingDaily}
            className="rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {drawingDaily ? "tirando…" : "Tirar carta de hoje"}
          </button>
        )}
        {dailyDraw && (
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
            <TarotCardFace card={dailyDraw.cards[0]} />
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-xl font-display mb-1">
                {dailyDraw.cards[0].name}
                {dailyDraw.cards[0].isReversed && <span className="text-accent-2 text-sm ml-2">invertida</span>}
              </h2>
              {dailyDraw.cards[0].suitLabel && (
                <p className="text-xs text-ink-dim mb-3 font-mono-label">{dailyDraw.cards[0].suitLabel}</p>
              )}
              <p className="text-ink-muted leading-relaxed">
                {dailyDraw.cards[0].isReversed ? dailyDraw.cards[0].reversed : dailyDraw.cards[0].upright}
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono-label text-xs text-ink-dim">tiragem livre · passado, presente, futuro</p>
          <button
            onClick={drawThree}
            disabled={drawingThree}
            className="text-sm rounded-full border border-line px-4 py-1.5 hover:border-accent transition-colors disabled:opacity-50"
          >
            {drawingThree ? "tirando…" : threeDraw ? "tirar de novo" : "tirar 3 cartas"}
          </button>
        </div>
        {threeDraw && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {threeDraw.cards.map((card, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs text-ink-dim font-mono-label mb-2">{POSITION_LABELS[i]}</p>
                <TarotCardFace card={card} compact />
                <h3 className="font-display text-base mt-3 mb-1">
                  {card.name}
                  {card.isReversed && <span className="text-accent-2 text-xs ml-2">invertida</span>}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {card.isReversed ? card.reversed : card.upright}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TarotCardFace({ card, compact }: { card: DrawnCard; compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface-2 flex items-center justify-center ${
        compact ? "h-28" : "h-64"
      }`}
      style={{ transform: card.isReversed ? "rotate(180deg)" : undefined }}
    >
      <span className={`font-display text-center px-3 ${compact ? "text-xs" : "text-sm"} text-ink-muted`}>
        {card.name}
      </span>
    </div>
  );
}
