import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraw, getTodayDraw } from "@/lib/repo";
import { drawRandomCards } from "@/lib/tarot";
import { getCardById } from "@/lib/tarot-data";
import { getPersonalizedTarotReading } from "@/lib/tarot-ai";
import { drawSchema } from "@/lib/validation";
import type { TarotDrawRecord } from "@/lib/types";

async function serializeDraw(userId: string, draw: TarotDrawRecord) {
  const aiReading = await getPersonalizedTarotReading(userId, draw);
  return {
    ...draw,
    aiReading,
    cards: draw.cardIds.map((id, i) => ({
      ...getCardById(id),
      isReversed: draw.reversed[i],
    })),
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const draw = await getTodayDraw(user.id);
  return NextResponse.json({ draw: draw ? await serializeDraw(user.id, draw) : null });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = drawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tiragem inválida." }, { status: 400 });
  }

  if (parsed.data.spread === "single") {
    const existing = await getTodayDraw(user.id);
    if (existing) {
      return NextResponse.json({ draw: await serializeDraw(user.id, existing) });
    }
  }

  const { cardIds, reversed } = drawRandomCards(parsed.data.spread);
  const draw = await createDraw({ userId: user.id, spread: parsed.data.spread, cardIds, reversed });
  return NextResponse.json({ draw: await serializeDraw(user.id, draw) });
}
