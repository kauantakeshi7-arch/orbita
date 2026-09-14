import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setDrawNote } from "@/lib/repo";
import { noteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nota inválida." }, { status: 400 });
  }
  const draw = await setDrawNote(parsed.data.drawId, user.id, parsed.data.note);
  if (!draw) {
    return NextResponse.json({ error: "Tiragem não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ draw });
}
