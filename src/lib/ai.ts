// Cliente mínimo da API do Gemini (REST direto, sem SDK extra). Toda
// chamada é best-effort: se faltar GEMINI_API_KEY ou a chamada falhar,
// retorna null e quem chamou cai pro conteúdo padrão (template).

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiPart {
  text?: string;
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

async function callGemini(
  contents: { role: "user" | "model"; parts: { text: string }[] }[],
  systemInstruction?: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction
          ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
          : {}),
        generationConfig: { temperature: 0.9, maxOutputTokens: 600 },
      }),
      // Evita que uma resposta lenta trave a request inteira.
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("[ai] Gemini respondeu", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    return text && text.length > 0 ? text : null;
  } catch (err) {
    console.error("[ai] Falha ao chamar Gemini:", err);
    return null;
  }
}

export async function askGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string | null> {
  return callGemini([{ role: "user", parts: [{ text: prompt }] }], systemInstruction);
}

/** Conversa multi-turno: `turns` é o histórico completo, incluindo a
 * mensagem mais recente do usuário como último item. */
export async function askGeminiConversation(
  turns: ChatTurn[],
  systemInstruction?: string
): Promise<string | null> {
  const contents = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
  return callGemini(contents, systemInstruction);
}
