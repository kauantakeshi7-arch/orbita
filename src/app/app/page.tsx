import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile, getStreak, getTodayDraw, listDraws, listChatMessages } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { getPersonalizedHoroscope } from "@/lib/horoscope";
import { computeXp, computeLevel, computeCosmicWeather, ACHIEVEMENTS, type UserStats } from "@/lib/gamification";

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

  const [streak, todayDraw, horoscope, draws, chatMessages] = await Promise.all([
    getStreak(user.id),
    getTodayDraw(user.id),
    getPersonalizedHoroscope(user.id, chart),
    listDraws(user.id),
    listChatMessages(user.id, 200),
  ]);

  const stats: UserStats = {
    streak,
    totalDraws: draws.length,
    chatMessages: chatMessages.filter((m) => m.role === "user").length,
    hasChart: true,
  };
  const xp = computeXp(stats);
  const { level, progress, xpForNext } = computeLevel(xp);
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.unlocked(stats, level));

  const todayKey = new Date().toISOString().slice(0, 10);
  const weather = computeCosmicWeather(user.id, todayKey);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-2">olá, {user.displayName}</p>
        <h1 className="text-3xl font-bold mb-1">
          <span className="text-gradient">
            {sun.signGlyph} {sun.signLabel} · {moon.signGlyph} {moon.signLabel} · {chart.ascendant.signGlyph}{" "}
            {chart.ascendant.signLabel} no Ascendente
          </span>
        </h1>
        <p className="text-ink-dim text-sm">o universo conspira a seu favor</p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono-label text-xs text-ink-dim">clima cósmico de hoje</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <WeatherStat label="Geral" value={weather.geral} color="var(--accent-2)" />
          <WeatherStat label="Amor" value={weather.amor} color="#f06f9a" />
          <WeatherStat label="Trabalho" value={weather.trabalho} color="var(--good)" />
          <WeatherStat label="Saúde" value={weather.saude} color="var(--accent)" />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono-label text-xs text-ink-dim mb-1">seu progresso</p>
            <p className="font-display text-lg">Nível {level}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="font-display text-lg">{streak}</p>
              <p className="text-[11px] text-ink-dim">sequência</p>
            </div>
            <div>
              <p className="font-display text-lg">{stats.totalDraws}</p>
              <p className="text-[11px] text-ink-dim">tiragens</p>
            </div>
            <div>
              <p className="font-display text-lg">{xp}</p>
              <p className="text-[11px] text-ink-dim">XP</p>
            </div>
          </div>
        </div>
        <div className="bar-track">
          <div
            className="bar-fill"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
          />
        </div>
        <p className="text-[11px] text-ink-dim mt-1.5">{xpForNext} XP para o próximo nível</p>
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono-label text-xs text-ink-dim">
            conquistas · {unlockedAchievements.length} de {ACHIEVEMENTS.length}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.unlocked(stats, level);
            return (
              <div
                key={a.key}
                className={`rounded-xl border p-4 text-center ${
                  unlocked ? "border-accent bg-surface" : "border-line bg-surface opacity-50"
                }`}
              >
                <p className="text-2xl mb-2">{unlocked ? a.icon : "🔒"}</p>
                <p className="text-xs font-semibold mb-1">{a.label}</p>
                <p className="text-[11px] text-ink-dim leading-snug">{a.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeatherStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="bar-track mb-2">
        <div className="bar-fill" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <p className="font-display text-lg" style={{ color }}>
        {value}
        <span className="text-xs text-ink-dim">/10</span>
      </p>
      <p className="text-[11px] text-ink-dim">{label}</p>
    </div>
  );
}

