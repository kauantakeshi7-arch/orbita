// Camada de gamificação: XP, nível e conquistas. Tudo calculado em cima de
// dados que já existem (sequência de tarot, total de tiragens, mensagens no
// chat) — sem tabela nova no banco, sem novo estado pra manter em sincronia.

export interface UserStats {
  streak: number;
  totalDraws: number;
  chatMessages: number;
  hasChart: boolean;
}

export function computeXp(stats: UserStats): number {
  return (
    stats.streak * 15 +
    stats.totalDraws * 10 +
    stats.chatMessages * 4 +
    (stats.hasChart ? 20 : 0)
  );
}

const XP_PER_LEVEL = 100;

export function computeLevel(xp: number): { level: number; xpIntoLevel: number; xpForNext: number; progress: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const xpForNext = XP_PER_LEVEL - xpIntoLevel;
  const progress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  return { level, xpIntoLevel, xpForNext, progress };
}

export interface Achievement {
  key: string;
  icon: string;
  label: string;
  description: string;
  unlocked: (stats: UserStats, level: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    key: "despertar",
    icon: "✨",
    label: "Despertar Cósmico",
    description: "Completou seu cadastro e gerou seu primeiro mapa",
    unlocked: (s) => s.hasChart,
  },
  {
    key: "viajante",
    icon: "🌟",
    label: "Viajante Estelar",
    description: "Manteve 3 dias consecutivos de tarot",
    unlocked: (s) => s.streak >= 3,
  },
  {
    key: "guardiao",
    icon: "🌙",
    label: "Guardião da Lua",
    description: "Manteve 7 dias consecutivos de tarot",
    unlocked: (s) => s.streak >= 7,
  },
  {
    key: "mestre",
    icon: "⭐",
    label: "Mestre das Estrelas",
    description: "Manteve 30 dias consecutivos de tarot",
    unlocked: (s) => s.streak >= 30,
  },
  {
    key: "vidente",
    icon: "🃏",
    label: "Vidente",
    description: "Realizou 10 tiragens de tarot",
    unlocked: (s) => s.totalDraws >= 10,
  },
  {
    key: "confidente",
    icon: "💬",
    label: "Confidente das Estrelas",
    description: "Trocou 10 mensagens no chat sobre o mapa",
    unlocked: (s) => s.chatMessages >= 10,
  },
  {
    key: "ascendente",
    icon: "🚀",
    label: "Ascendente Cósmico",
    description: "Alcançou o nível 5",
    unlocked: (_s, level) => level >= 5,
  },
  {
    key: "iluminado",
    icon: "💫",
    label: "Iluminado",
    description: "Alcançou o nível 10",
    unlocked: (_s, level) => level >= 10,
  },
];

// ---------- Clima cósmico diário ----------
// Placar 0-10 determinístico por dia+usuário (mesmo hash o dia todo, muda
// no dia seguinte) — não é IA, é só uma forma leve de dar uma variação
// diária real sem gerar conteúdo novo a cada request.

function seededScore(seed: string, min = 6, max = 10): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

export interface CosmicWeather {
  geral: number;
  amor: number;
  trabalho: number;
  saude: number;
}

export function computeCosmicWeather(userId: string, dateKey: string): CosmicWeather {
  const base = `${userId}:${dateKey}`;
  return {
    geral: seededScore(base + ":geral"),
    amor: seededScore(base + ":amor"),
    trabalho: seededScore(base + ":trabalho"),
    saude: seededScore(base + ":saude"),
  };
}
