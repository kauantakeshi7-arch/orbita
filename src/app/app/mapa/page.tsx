import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { ChartWheel } from "@/components/ChartWheel";
import {
  computeElementDistribution,
  computeQualityDistribution,
  computeRetrogradeCount,
  computeHouseRulers,
  computeBigThreeSynthesis,
  ELEMENT_LABELS_PT,
  QUALITY_LABELS_PT,
  ASPECT_MEANINGS,
  type Element,
  type Quality,
} from "@/lib/astrology-insights";

const ELEMENT_COLORS: Record<Element, string> = {
  fire: "#f06f6f",
  earth: "var(--good)",
  air: "var(--accent)",
  water: "#6fb3f0",
};
const QUALITY_COLORS: Record<Quality, string> = {
  cardinal: "var(--accent-2)",
  fixed: "var(--good)",
  mutable: "var(--accent)",
};

export default async function MapaPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getBirthProfile(user.id);

  if (!profile) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-3">Ainda sem mapa</h1>
        <p className="text-ink-muted mb-6">Complete seus dados de nascimento primeiro.</p>
        <Link href="/app/perfil" className="rounded-full bg-accent text-ground px-6 py-3 font-semibold">
          Completar meus dados
        </Link>
      </div>
    );
  }

  const [year, month, day] = profile.birthDate.split("-").map(Number);
  const [hour, minute] = profile.timeUnknown ? [12, 0] : profile.birthTime.split(":").map(Number);
  const chart = computeNatalChart({
    year, month, day, hour, minute,
    latitude: profile.latitude, longitude: profile.longitude,
  });

  const elements = computeElementDistribution(chart);
  const qualities = computeQualityDistribution(chart);
  const retrogradeCount = computeRetrogradeCount(chart);
  const houseRulers = computeHouseRulers(chart);
  const bigThree = computeBigThreeSynthesis(chart);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-2">mapa astral</p>
        <h1 className="text-2xl font-bold mb-3">
          <span className="text-gradient">{profile.placeLabel}</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs rounded-full border border-line px-3 py-1 text-ink-muted font-mono-label">
            {new Date(profile.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </span>
          <span className="text-xs rounded-full border border-line px-3 py-1 text-ink-muted font-mono-label">
            {profile.timeUnknown ? "hora aproximada" : profile.birthTime}
          </span>
          {retrogradeCount > 0 && (
            <span className="text-xs rounded-full border border-accent-2 px-3 py-1 text-accent-2 font-mono-label">
              {retrogradeCount} planeta{retrogradeCount === 1 ? "" : "s"} retrógrado{retrogradeCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="font-mono-label text-xs text-ink-dim mb-3">elementos</p>
          <div className="flex flex-col gap-2.5">
            {(Object.keys(ELEMENT_LABELS_PT) as Element[]).map((el) => (
              <div key={el}>
                <div className="flex justify-between text-xs text-ink-muted mb-1">
                  <span>{ELEMENT_LABELS_PT[el]}</span>
                  <span className="font-mono-label">{elements.percentages[el]}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${elements.percentages[el]}%`, background: ELEMENT_COLORS[el] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="font-mono-label text-xs text-ink-dim mb-3">qualidades</p>
          <div className="flex flex-col gap-2.5">
            {(Object.keys(QUALITY_LABELS_PT) as Quality[]).map((q) => (
              <div key={q}>
                <div className="flex justify-between text-xs text-ink-muted mb-1">
                  <span>{QUALITY_LABELS_PT[q]}</span>
                  <span className="font-mono-label">{qualities.percentages[q]}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${qualities.percentages[q]}%`, background: QUALITY_COLORS[q] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        <div className="rounded-xl border border-line bg-surface p-4 flex items-center justify-center lg:self-start lg:sticky lg:top-6">
          <div className="w-full max-w-[320px]">
            <ChartWheel chart={chart} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-3">ângulos</p>
            <div className="grid grid-cols-2 gap-3">
              <PointRow point={chart.ascendant} />
              <PointRow point={chart.midheaven} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <p className="font-mono-label text-xs text-ink-dim mb-3">
              síntese do big three · harmonia {bigThree.harmony}
            </p>
            <div className="flex flex-col gap-3 text-sm text-ink-muted leading-relaxed">
              <p>
                <span className="text-ink font-semibold">Dinâmica Sol-Lua: </span>
                {bigThree.dynamicText}
              </p>
              <p>
                <span className="text-ink font-semibold">Equilíbrio elemental: </span>
                {bigThree.elementBalanceText}
              </p>
              <p>
                <span className="text-ink font-semibold">Influência do Ascendente: </span>
                {bigThree.ascendantText}
              </p>
              <p className="rounded-lg bg-surface-2 p-3">
                <span className="text-ink font-semibold">Tema central: </span>
                {bigThree.themeText}
              </p>
            </div>
          </div>

          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-3">regentes das casas</p>
            <div className="grid grid-cols-2 gap-3">
              {houseRulers.map((r) => (
                <div key={r.houseId} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-label text-xs text-ink-dim">casa {r.houseId}</span>
                    <span className="text-xs text-ink-dim">{r.label}</span>
                  </div>
                  <p className="text-xs text-ink-dim mb-1">
                    cúspide em {r.cuspSignLabel}
                  </p>
                  <p className="font-display text-base">
                    {r.rulerGlyph} {r.rulerLabel}
                  </p>
                  <p className="text-xs text-ink-muted">
                    em {r.rulerSignLabel}
                    {r.rulerHouseId ? ` · casa ${r.rulerHouseId}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-3">planetas</p>
            <div className="rounded-xl border border-line bg-surface overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[...chart.planets, ...chart.points].map((p) => (
                    <tr key={p.key} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 text-ink-muted w-8">{p.glyph}</td>
                      <td className="px-2 py-2.5">{p.label}</td>
                      <td className="px-2 py-2.5 text-ink-muted">
                        {p.signGlyph} {p.signLabel} {p.degreeInSign}°
                        {p.retrograde && <span className="text-accent-2 ml-1">℞</span>}
                      </td>
                      <td className="px-4 py-2.5 text-ink-dim font-mono-label text-xs text-right">
                        {p.houseId ? `casa ${p.houseId}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-3">casas</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chart.houses.map((h) => (
                <div key={h.id} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                  <span className="text-ink-dim font-mono-label text-xs mr-2">{h.id}</span>
                  {h.signLabel} {h.startDegreeInSign}°
                </div>
              ))}
            </div>
          </div>

          {chart.aspects.length > 0 && (
            <div>
              <p className="font-mono-label text-xs text-ink-dim mb-3">
                aspectos ({chart.aspects.length})
              </p>
              <div className="flex flex-col gap-2">
                {chart.aspects.slice(0, 20).map((a, i) => {
                  const meaning = ASPECT_MEANINGS[a.type];
                  return (
                    <details key={i} className="rounded-xl border border-line bg-surface p-4 group">
                      <summary className="cursor-pointer list-none flex items-center justify-between">
                        <span className="text-sm">
                          <span className="font-semibold">{a.aLabel}</span>{" "}
                          <span className="text-ink-dim">{a.typeLabel.toLowerCase()}</span>{" "}
                          <span className="font-semibold">{a.bLabel}</span>
                        </span>
                        <span className="text-ink-dim text-xs group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      {meaning && (
                        <div className="mt-3 pt-3 border-t border-line">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {meaning.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono-label rounded-full bg-surface-2 px-2 py-0.5 text-accent"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-ink-muted leading-relaxed">{meaning.text}</p>
                        </div>
                      )}
                    </details>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PointRow({ point }: { point: { glyph: string; label: string; signGlyph: string; signLabel: string; degreeInSign: number } }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-ink-dim mb-1">{point.label}</p>
      <p className="font-display text-lg">
        {point.signGlyph} {point.signLabel} {point.degreeInSign}°
      </p>
    </div>
  );
}
