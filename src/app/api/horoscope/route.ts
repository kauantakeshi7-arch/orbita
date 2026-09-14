import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { buildDailyHoroscope } from "@/lib/horoscope";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const profile = await getBirthProfile(user.id);
  if (!profile) {
    return NextResponse.json({ horoscope: null });
  }
  const [year, month, day] = profile.birthDate.split("-").map(Number);
  const [hour, minute] = profile.timeUnknown
    ? [12, 0]
    : profile.birthTime.split(":").map(Number);
  const chart = computeNatalChart({
    year,
    month,
    day,
    hour,
    minute,
    latitude: profile.latitude,
    longitude: profile.longitude,
  });
  const sun = chart.planets.find((p) => p.key === "sun");
  const horoscope = buildDailyHoroscope(sun?.sign ?? "aries");
  return NextResponse.json({ horoscope });
}
