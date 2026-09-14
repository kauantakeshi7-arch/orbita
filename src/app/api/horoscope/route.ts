import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { getPersonalizedHoroscope } from "@/lib/horoscope";

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
  const horoscope = await getPersonalizedHoroscope(user.id, chart);
  return NextResponse.json({ horoscope });
}
