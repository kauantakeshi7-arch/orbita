import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraw, getTodayDraw } from "@/lib/repo";
import { drawRandomCards } from "@/lib/tarot";
import { getCardById } from "@/lib/tarot-data";
import { drawSchema } from "@/lib/validation";
import type { TarotDrawRecord } from "@/lib/types";

function serializeDraw(draw: TarotDrawRecord) {
  return {
    ...draw,
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
  return NextResponse.json({ draw: draw ? serializeDraw(draw) : null });
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
      return NextResponse.json({ draw: serializeDraw(existing) });
    }
  }

  const { cardIds, reversed } = drawRandomCards(parsed.data.spread);
  const draw = await createDraw({ userId: user.id, spread: parsed.data.spread, cardIds, reversed });
  return NextResponse.json({ draw: serializeDraw(draw) });
}
