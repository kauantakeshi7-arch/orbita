import pkg from "circular-natal-horoscope-js";
const { Origin, Horoscope } = pkg as unknown as {
  Origin: new (args: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
  }) => unknown;
  Horoscope: new (args: {
    origin: unknown;
    houseSystem: string;
    zodiac: string;
    aspectPoints: string[];
    aspectWithPoints: string[];
    aspectTypes: string[];
    language: string;
  }) => { CelestialBodies: Record<string, { Sign: { key: string } }> };
};

import { SIGN_LABELS_PT } from "./astrology";

const MOON_MOOD_PT: Record<string, string> = {
  aries: "o dia pede iniciativa: comece antes de pensar demais",
  taurus: "o ritmo desacelera e pede constância, não pressa",
  gemini: "a cabeça fica mais rápida que o corpo — troque ideias",
  cancer: "o clima fica mais sensível, ótimo pra cuidar de quem importa",
  leo: "vontade de aparecer e ser notado toma conta",
  virgo: "o olho fica mais crítico — útil pra ajustar detalhes",
  libra: "buscar equilíbrio nas relações vira prioridade natural",
  scorpio: "tudo fica mais intenso, inclusive o que você prefere evitar",
  sagittarius: "o horizonte parece mais largo — bom dia pra planos grandes",
  capricorn: "o foco vai pro que é concreto e de longo prazo",
  aquarius: "vontade de fugir da rotina e pensar diferente do grupo",
  pisces: "os limites ficam mais porosos — confie mais na intuição",
};

const SUN_FLAVOR_PT: Record<string, string> = {
  aries: "acelerar ainda mais o seu já natural ímpeto de sair na frente.",
  taurus: "testar sua paciência, mas também reforçar o que você já vinha construindo.",
  gemini: "render boas conversas — sua curiosidade combina bem com esse clima.",
  cancer: "falar direto com o que você mais valoriza: vínculo e memória.",
  leo: "combinar bem com sua vontade natural de brilhar sem pedir licença.",
  virgo: "ativar seu instinto de resolver e organizar o que estava solto.",
  libra: "facilitar decisões que você vinha adiando por medo de desagradar.",
  scorpio: "aprofundar algo que você já sentia rondando por baixo da superfície.",
  sagittarius: "abrir espaço pra você dizer sim a algo fora do previsto.",
  capricorn: "te dar um empurrão extra pra seguir o plano que você já tem.",
  aquarius: "reforçar sua vontade de fazer diferente do que se espera de você.",
  pisces: "deixar sua intuição ainda mais afiada do que o normal.",
};

export function getTodayMoonSign(): string {
  const now = new Date();
  const origin = new Origin({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
    date: now.getUTCDate(),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
    latitude: 0,
    longitude: 0,
  });
  const horoscope = new Horoscope({
    origin,
    houseSystem: "whole-sign",
    zodiac: "tropical",
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
    language: "en",
  });
  return horoscope.CelestialBodies.moon.Sign.key;
}

export interface DailyHoroscope {
  moonSign: string;
  moonSignLabel: string;
  moodLine: string;
  sunSign: string;
  sunSignLabel: string;
  flavorLine: string;
  text: string;
}

export function buildDailyHoroscope(sunSign: string): DailyHoroscope {
  const moonSign = getTodayMoonSign();
  const moodLine = MOON_MOOD_PT[moonSign] ?? "o clima do dia pede atenção ao que muda rápido";
  const flavorLine =
    SUN_FLAVOR_PT[sunSign] ?? "pedir mais atenção ao que normalmente passa despercebido.";
  const moonSignLabel = SIGN_LABELS_PT[moonSign] ?? moonSign;
  const sunSignLabel = SIGN_LABELS_PT[sunSign] ?? sunSign;
  const text = `Com a Lua em ${moonSignLabel} hoje, ${moodLine}. Pra você, de Sol em ${sunSignLabel}, isso tende a ${flavorLine}`;
  return { moonSign, moonSignLabel, moodLine, sunSign, sunSignLabel, flavorLine, text };
}
