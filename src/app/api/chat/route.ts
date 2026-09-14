import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile, listChatMessages, addChatMessage } from "@/lib/repo";
import { computeNatalChart, SIGN_LABELS_PT } from "@/lib/astrology";
import { askGeminiConversation, type ChatTurn } from "@/lib/ai";
import { z } from "zod";

const messageSchema = z.object({ message: z.string().min(1).max(1000) });

function buildSystemInstruction(chartSummary: string | null): string {
  const base = `Você é a Órbita, assistente de astrologia do app Órbita. Tom: caloroso, direto, específico, sem clichê místico ("os astros se alinham", "confie no universo"). Português do Brasil. Respostas curtas (2 a 5 frases) — isso é um chat, não um artigo. Se a pergunta não tiver relação com astrologia, tarot ou autoconhecimento, redirecione com gentileza pro tema do app.`;
  if (!chartSummary) {
    return `${base} A pessoa ainda não cadastrou os dados de nascimento, então você não tem o mapa astral dela — pode responder de forma geral, mas sugira completar o cadastro pra respostas personalizadas.`;
  }
  return `${base}\n\nMapa astral real da pessoa com quem você está conversando:\n${chartSummary}\n\nUse esses dados pra personalizar suas respostas sempre que fizer sentido.`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const messages = await listChatMessages(user.id, 50);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }

  const profile = await getBirthProfile(user.id);
  let chartSummary: string | null = null;
  if (profile) {
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
    const planetLines = [...chart.planets, ...chart.points]
      .map((p) => `${p.label}: ${p.signLabel}${p.houseId ? `, casa ${p.houseId}` : ""}`)
      .join("; ");
    chartSummary = `Ascendente: ${SIGN_LABELS_PT[chart.ascendant.sign] ?? chart.ascendant.sign}. ${planetLines}.`;
  }

  const history = await listChatMessages(user.id, 20);
  const turns: ChatTurn[] = [
    ...history.map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("model" as const),
      text: h.content,
    })),
    { role: "user", text: parsed.data.message },
  ];

  const reply = await askGeminiConversation(turns, buildSystemInstruction(chartSummary));

  await addChatMessage(user.id, "user", parsed.data.message);
  const finalReply =
    reply ??
    "Não consegui pensar em uma resposta agora — tenta de novo em alguns segundos?";
  await addChatMessage(user.id, "assistant", finalReply);

  return NextResponse.json({ reply: finalReply, unavailable: !reply });
}
