import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile, saveBirthProfile } from "@/lib/repo";
import { computeNatalChart } from "@/lib/astrology";
import { birthProfileSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const profile = await getBirthProfile(user.id);
  if (!profile) {
    return NextResponse.json({ profile: null, chart: null });
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
  return NextResponse.json({ profile, chart });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = birthProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const profile = await saveBirthProfile({ userId: user.id, ...parsed.data });

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

  return NextResponse.json({ profile, chart });
}
