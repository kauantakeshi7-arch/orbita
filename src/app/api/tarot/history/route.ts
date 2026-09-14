import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listDraws } from "@/lib/repo";
import { getCardById } from "@/lib/tarot-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const draws = await listDraws(user.id);
  const serialized = draws.map((draw) => ({
    ...draw,
    cards: draw.cardIds.map((id, i) => ({
      ...getCardById(id),
      isReversed: draw.reversed[i],
    })),
  }));
  return NextResponse.json({ draws: serialized });
}
