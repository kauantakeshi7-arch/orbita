// Camada de interpretação em cima do NatalChart (src/lib/astrology.ts).
// Tudo aqui é determinístico (sem IA) — cálculos e textos-modelo, pra ficar
// instantâneo e gratuito. A parte com IA continua em horoscope.ts / tarot-ai.ts.

import type { NatalChart, ChartPoint } from "./astrology";
import { SIGN_LABELS_PT, PLANET_LABELS_PT, PLANET_GLYPHS } from "./astrology";

export type Element = "fire" | "earth" | "air" | "water";
export type Quality = "cardinal" | "fixed" | "mutable";

export const ELEMENT_LABELS_PT: Record<Element, string> = {
  fire: "Fogo",
  earth: "Terra",
  air: "Ar",
  water: "Água",
};

export const QUALITY_LABELS_PT: Record<Quality, string> = {
  cardinal: "Cardinal",
  fixed: "Fixo",
  mutable: "Mutável",
};

const ELEMENT_BY_SIGN: Record<string, Element> = {
  aries: "fire",
  leo: "fire",
  sagittarius: "fire",
  taurus: "earth",
  virgo: "earth",
  capricorn: "earth",
  gemini: "air",
  libra: "air",
  aquarius: "air",
  cancer: "water",
  scorpio: "water",
  pisces: "water",
};

const QUALITY_BY_SIGN: Record<string, Quality> = {
  aries: "cardinal",
  cancer: "cardinal",
  libra: "cardinal",
  capricorn: "cardinal",
  taurus: "fixed",
  leo: "fixed",
  scorpio: "fixed",
  aquarius: "fixed",
  gemini: "mutable",
  virgo: "mutable",
  sagittarius: "mutable",
  pisces: "mutable",
};

// Regente moderno de cada signo.
const RULER_BY_SIGN: Record<string, string> = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune",
};

export interface Distribution<T extends string> {
  counts: Record<T, number>;
  percentages: Record<T, number>;
  dominant: T;
  total: number;
}

function distribute<T extends string>(
  planets: ChartPoint[],
  mapping: Record<string, T>,
  keys: T[]
): Distribution<T> {
  const counts = Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
  for (const p of planets) {
    const k = mapping[p.sign];
    if (k) counts[k] += 1;
  }
  const total = planets.length;
  const percentages = Object.fromEntries(
    keys.map((k) => [k, total ? Math.round((counts[k] / total) * 100) : 0])
  ) as Record<T, number>;
  const dominant = keys.reduce((best, k) => (counts[k] > counts[best] ? k : best), keys[0]);
  return { counts, percentages, dominant, total };
}

export function computeElementDistribution(chart: NatalChart): Distribution<Element> {
  return distribute(chart.planets, ELEMENT_BY_SIGN, ["fire", "earth", "air", "water"]);
}

export function computeQualityDistribution(chart: NatalChart): Distribution<Quality> {
  return distribute(chart.planets, QUALITY_BY_SIGN, ["cardinal", "fixed", "mutable"]);
}

export function computeRetrogradeCount(chart: NatalChart): number {
  return chart.planets.filter((p) => p.retrograde).length;
}

// ---------- Regentes das casas angulares ----------

export interface HouseRuler {
  houseId: number;
  label: string;
  cuspSign: string;
  cuspSignLabel: string;
  rulerKey: string;
  rulerLabel: string;
  rulerGlyph: string;
  rulerSignLabel: string;
  rulerHouseId: number | null;
}

const ANGULAR_HOUSES: { id: number; label: string }[] = [
  { id: 1, label: "Identidade" },
  { id: 4, label: "Lar" },
  { id: 7, label: "Parcerias" },
  { id: 10, label: "Carreira" },
];

export function computeHouseRulers(chart: NatalChart): HouseRuler[] {
  const allPoints = [...chart.planets, ...chart.points];
  return ANGULAR_HOUSES.map(({ id, label }) => {
    const house = chart.houses.find((h) => h.id === id);
    const cuspSign = house?.sign ?? "aries";
    const rulerKey = RULER_BY_SIGN[cuspSign] ?? "sun";
    const rulerBody = allPoints.find((p) => p.key === rulerKey);
    return {
      houseId: id,
      label,
      cuspSign,
      cuspSignLabel: SIGN_LABELS_PT[cuspSign] ?? cuspSign,
      rulerKey,
      rulerLabel: PLANET_LABELS_PT[rulerKey] ?? rulerKey,
      rulerGlyph: PLANET_GLYPHS[rulerKey] ?? "✦",
      rulerSignLabel: rulerBody ? rulerBody.signLabel : "—",
      rulerHouseId: rulerBody?.houseId ?? null,
    };
  });
}

// ---------- Síntese do Big Three (Sol + Lua + Ascendente) ----------

const ELEMENT_COMPATIBLE: Record<Element, Element> = {
  fire: "air",
  air: "fire",
  earth: "water",
  water: "earth",
};
const ELEMENT_OPPOSITE: Record<Element, Element> = {
  fire: "water",
  water: "fire",
  earth: "air",
  air: "earth",
};

export type HarmonyLevel = "alta" | "média" | "baixa";

export interface BigThreeSynthesis {
  harmony: HarmonyLevel;
  sunElement: Element;
  moonElement: Element;
  dynamicText: string;
  elementBalanceText: string;
  ascendantText: string;
  themeText: string;
}

const ASCENDANT_TEXT_BY_ELEMENT: Record<Element, string> = {
  fire: "Você se apresenta com energia, entusiasmo e iniciativa. A primeira impressão é de alguém ativo e direto.",
  earth: "Você se apresenta com firmeza e praticidade. A primeira impressão é de alguém confiável e com os pés no chão.",
  air: "Você se apresenta com curiosidade e facilidade de comunicação. A primeira impressão é de alguém sociável e mentalmente ágil.",
  water: "Você se apresenta com sensibilidade e intuição. A primeira impressão é de alguém receptivo e emocionalmente presente.",
};

const THEME_TEXT_BY_ELEMENT: Record<Element, string> = {
  fire: "Seu mapa é puxado por energia de Fogo — você é naturalmente iniciador e corajoso. Cuidado para não se esgotar acelerando demais.",
  earth: "Seu mapa é puxado por energia de Terra — você constrói de forma sólida e duradoura. Cuidado para não travar por excesso de cautela.",
  air: "Seu mapa é puxado por energia de Ar — ideias e conexões fluem com facilidade. Cuidado para não dispersar antes de concluir.",
  water: "Seu mapa é puxado por energia de Água — sua bússola é a emoção e a intuição. Cuidado para não se perder em sensibilidade demais.",
};

export function computeBigThreeSynthesis(chart: NatalChart): BigThreeSynthesis {
  const sun = chart.planets.find((p) => p.key === "sun")!;
  const moon = chart.planets.find((p) => p.key === "moon")!;
  const sunElement = ELEMENT_BY_SIGN[sun.sign];
  const moonElement = ELEMENT_BY_SIGN[moon.sign];
  const ascElement = ELEMENT_BY_SIGN[chart.ascendant.sign];

  let harmony: HarmonyLevel;
  if (sunElement === moonElement) harmony = "alta";
  else if (ELEMENT_COMPATIBLE[sunElement] === moonElement) harmony = "alta";
  else if (ELEMENT_OPPOSITE[sunElement] === moonElement) harmony = "baixa";
  else harmony = "média";

  const dist = computeElementDistribution(chart);

  const dynamicText =
    sunElement === moonElement
      ? `Sol e Lua em ${ELEMENT_LABELS_PT[sunElement]} criam uma personalidade coesa: o que você quer e o que você sente apontam na mesma direção.`
      : `Sol em ${ELEMENT_LABELS_PT[sunElement]} combinado com Lua em ${ELEMENT_LABELS_PT[moonElement]} cria uma personalidade que integra ${ELEMENT_LABELS_PT[sunElement]} e ${ELEMENT_LABELS_PT[moonElement]}.`;

  const elementBalanceText = `${ELEMENT_LABELS_PT[dist.dominant]} é o elemento dominante do seu mapa (${dist.percentages[dist.dominant]}% dos planetas). Harmonia entre Sol e Lua: ${harmony}.`;

  return {
    harmony,
    sunElement,
    moonElement,
    dynamicText,
    elementBalanceText,
    ascendantText: ASCENDANT_TEXT_BY_ELEMENT[ascElement],
    themeText: THEME_TEXT_BY_ELEMENT[dist.dominant],
  };
}

// ---------- Interpretação por tipo de aspecto ----------

export interface AspectMeaning {
  tags: string[];
  text: string;
}

export const ASPECT_MEANINGS: Record<string, AspectMeaning> = {
  conjunction: {
    tags: ["união", "intensificação", "fusão"],
    text: "As energias dos dois planetas se fundem — o que um representa reforça (ou complica) o outro, quase como se fossem uma coisa só.",
  },
  opposition: {
    tags: ["tensão", "polaridade", "equilíbrio"],
    text: "Os dois planetas puxam em direções opostas. O desafio é integrar as duas pontas em vez de viver alternando entre elas.",
  },
  trine: {
    tags: ["fluidez", "talento natural", "facilidade"],
    text: "As energias conversam sem esforço — é um talento natural, mas que pode ficar subaproveitado se não for exercitado de propósito.",
  },
  square: {
    tags: ["atrito", "crescimento", "ação"],
    text: "Fricção que exige ação. É desconfortável, mas costuma ser o que mais empurra crescimento real no seu mapa.",
  },
  sextile: {
    tags: ["oportunidade", "cooperação"],
    text: "Uma abertura que precisa ser aproveitada — a energia ajuda, mas não acontece sozinha; exige uma escolha ativa.",
  },
  quincunx: {
    tags: ["ajuste", "desconforto sutil"],
    text: "Os dois planetas falam línguas diferentes. Pede ajustes constantes em vez de uma solução única e definitiva.",
  },
};
