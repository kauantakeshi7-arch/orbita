import { askGemini } from "./ai";
import { getAiContent, saveAiContent, getBirthProfile } from "./repo";
import { computeNatalChart, SIGN_LABELS_PT } from "./astrology";
import { getCardById, type TarotCard } from "./tarot-data";
import type { TarotDrawRecord } from "./types";

const TAROT_SYSTEM_INSTRUCTION = `Você escreve leituras de tarot do Órbita, um app moderno e direto, sem clichê místico. Conecte o significado da carta ao mapa astral real da pessoa quando os dados estiverem disponíveis. Tom: caloroso, direto, específico — nunca genérico tipo horóscopo de jornal. Português do Brasil. Responda só com o texto da leitura, 2 a 4 frases por carta (se houver mais de uma), sem saudação, sem markdown, sem aspas.`;

function cardDescription(card: TarotCard, isReversed: boolean): string {
  const meaning = isReversed ? card.reversed : card.upright;
  return `${card.name}${isReversed ? " (invertida)" : ""}: ${meaning}`;
}

/**
 * Gera (ou busca do cache) uma leitura personalizada em cima da tiragem,
 * cruzando as cartas com o mapa natal da pessoa quando disponível. Nunca
 * lança erro — se a IA falhar, retorna null e a UI mostra só o significado
 * padrão das cartas (que já é sempre exibido).
 */
export async function getPersonalizedTarotReading(
  userId: string,
  draw: TarotDrawRecord
): Promise<string | null> {
  const cached = await getAiContent(userId, "tarot_reading", draw.id);
  if (cached) return cached;

  const cards = draw.cardIds.map((id, i) => {
    const card = getCardById(id);
    return cardDescription(card, draw.reversed[i]);
  });

  let chartLine = "";
  const profile = await getBirthProfile(userId);
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
    const sun = chart.planets.find((p) => p.key === "sun");
    const moon = chart.planets.find((p) => p.key === "moon");
    chartLine = `Mapa astral da pessoa: Sol em ${sun ? SIGN_LABELS_PT[sun.sign] : "?"}, Lua em ${
      moon ? SIGN_LABELS_PT[moon.sign] : "?"
    }, Ascendente em ${SIGN_LABELS_PT[chart.ascendant.sign] ?? chart.ascendant.sign}.`;
  }

  const prompt = `Tiragem de tarot (${draw.spread === "single" ? "carta única do dia" : draw.spread === "three" ? "passado, presente, futuro" : "cruz celta"}):
${cards.map((c, i) => `${i + 1}. ${c}`).join("\n")}

${chartLine}

Escreva a leitura conectando as cartas entre si (se houver mais de uma) e, se houver mapa astral, com os placements da pessoa.`;

  const aiText = await askGemini(prompt, TAROT_SYSTEM_INSTRUCTION);
  if (!aiText) return null;

  await saveAiContent(userId, "tarot_reading", draw.id, aiText);
  return aiText;
}
