import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { ChartWheel } from "@/components/ChartWheel";

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-2">mapa astral</p>
        <h1 className="text-2xl font-bold">
          {profile.placeLabel} · {new Date(profile.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
          {profile.timeUnknown ? " · hora aproximada" : ` · ${profile.birthTime}`}
        </h1>
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
              <p className="font-mono-label text-xs text-ink-dim mb-3">aspectos principais</p>
              <div className="flex flex-wrap gap-2">
                {chart.aspects.slice(0, 16).map((a, i) => (
                  <span key={i} className="text-xs rounded-full border border-line px-3 py-1 text-ink-muted">
                    {a.a} {a.typeLabel.toLowerCase()} {a.b}
                  </span>
                ))}
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
