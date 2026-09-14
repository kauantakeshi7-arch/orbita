import { getCurrentUser } from "@/lib/auth";
import { listDraws } from "@/lib/repo";
import { getCardById } from "@/lib/tarot-data";
import { DrawNote } from "@/components/DrawNote";

const SPREAD_LABELS: Record<string, string> = {
  single: "carta do dia",
  three: "passado · presente · futuro",
  "celtic-cross": "cruz celta",
};

export default async function DiarioPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const draws = await listDraws(user.id);

  if (draws.length === 0) {
    return (
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-3">diário astral</p>
        <p className="text-ink-muted">Suas tiragens de tarot vão aparecer aqui, com data e suas anotações.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono-label text-xs text-ink-dim">diário astral</p>
      {draws.map((draw) => (
        <div key={draw.id} className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-ink-muted">
              {new Date(draw.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <span className="text-xs text-ink-dim font-mono-label">{SPREAD_LABELS[draw.spread]}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {draw.cardIds.map((id, i) => {
              const card = getCardById(id);
              return (
                <span key={i} className="text-sm rounded-full border border-line px-3 py-1">
                  {card.name}
                  {draw.reversed[i] && <span className="text-accent-2 ml-1 text-xs">invertida</span>}
                </span>
              );
            })}
          </div>
          <DrawNote drawId={draw.id} initialNote={draw.note} />
        </div>
      ))}
    </div>
  );
}
