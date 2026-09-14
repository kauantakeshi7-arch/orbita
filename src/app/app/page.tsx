import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile, getStreak, getTodayDraw } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { getPersonalizedHoroscope } from "@/lib/horoscope";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getBirthProfile(user.id);

  if (!profile) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-3">Falta um passo</h1>
        <p className="text-ink-muted mb-6">
          A gente ainda não tem seus dados de nascimento pra calcular seu mapa.
        </p>
        <Link
          href="/app/perfil"
          className="inline-block rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
        >
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
  const sun = chart.planets.find((p) => p.key === "sun")!;
  const moon = chart.planets.find((p) => p.key === "moon")!;

  const [streak, todayDraw, horoscope] = await Promise.all([
    getStreak(user.id),
    getTodayDraw(user.id),
    getPersonalizedHoroscope(user.id, chart),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-2">olá, {user.displayName}</p>
        <h1 className="text-3xl font-bold mb-4">
          {sun.signGlyph} {sun.signLabel} · {moon.signGlyph} {moon.signLabel} · {chart.ascendant.signGlyph}{" "}
          {chart.ascendant.signLabel} no Ascendente
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="sequência de tarot" value={`${streak} dia${streak === 1 ? "" : "s"}`} />
        <StatTile label="Sol" value={`${sun.signGlyph} ${sun.signLabel}`} />
        <StatTile label="Lua hoje" value={`${horoscope.moonSignLabel}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="font-mono-label text-xs text-ink-dim mb-2 flex items-center gap-2">
            horóscopo de hoje
            {horoscope.aiGenerated && (
              <span className="text-accent normal-case font-sans">· por IA</span>
            )}
          </p>
          <p className="text-ink-muted leading-relaxed">{horoscope.text}</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 flex flex-col justify-between">
          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-2">tarot do dia</p>
            <p className="text-ink-muted mb-4">
              {todayDraw ? "Você já tirou sua carta hoje." : "Sua tiragem gratuita de hoje ainda não foi feita."}
            </p>
          </div>
          <Link
            href="/app/tarot"
            className="inline-block self-start rounded-full bg-accent text-ground px-5 py-2.5 font-semibold hover:opacity-90 transition-opacity"
          >
            {todayDraw ? "Ver carta de hoje" : "Tirar carta"}
          </Link>
        </div>
      </div>

      <Link
        href="/app/mapa"
        className="rounded-xl border border-line bg-surface p-6 hover:border-accent transition-colors flex items-center justify-between"
      >
        <div>
          <p className="font-mono-label text-xs text-ink-dim mb-2">mapa completo</p>
          <p className="text-ink-muted">Planetas, casas e aspectos — sua carta astral por inteiro.</p>
        </div>
        <span className="text-accent text-xl">→</span>
      </Link>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="font-display text-xl mb-1">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}
