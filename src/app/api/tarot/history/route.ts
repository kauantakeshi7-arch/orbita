import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listDraws, getAiContent } from "@/lib/repo";
import { getCardById } from "@/lib/tarot-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const draws = await listDraws(user.id);
  // Só lê do cache (não gera na hora) pra listagem do diário carregar rápido.
  const serialized = await Promise.all(
    draws.map(async (draw) => ({
      ...draw,
      aiReading: await getAiContent(user.id, "tarot_reading", draw.id),
      cards: draw.cardIds.map((id, i) => ({
        ...getCardById(id),
        isReversed: draw.reversed[i],
      })),
    }))
  );
  return NextResponse.json({ draws: serialized });
}
