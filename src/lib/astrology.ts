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
  }) => HoroscopeResult;
};

// ---------- Tipos mínimos do que usamos da lib (ela não publica .d.ts) ----------
interface EclipticPos {
  DecimalDegrees: number;
}
interface ChartPos {
  Ecliptic: EclipticPos;
}
interface SignInfo {
  key: string;
  label: string;
}
interface HouseRef {
  id: number;
}
interface BodyInfo {
  key: string;
  label: string;
  Sign: SignInfo;
  ChartPosition: ChartPos;
  House: HouseRef;
  isRetrograde: boolean;
}
interface PointInfo {
  key: string;
  label: string;
  Sign: SignInfo;
  ChartPosition: ChartPos;
  House: HouseRef;
}
interface AngleInfo {
  Sign: SignInfo;
  ChartPosition: ChartPos;
}
interface HouseInfo {
  id: number;
  Sign: SignInfo;
  ChartPosition: { StartPosition: ChartPos };
}
interface AspectInfo {
  point1Key: string;
  point2Key: string;
  aspectKey: string;
  orb: number;
}
interface HoroscopeResult {
  Ascendant: AngleInfo;
  Midheaven: AngleInfo;
  CelestialBodies: Record<string, BodyInfo>;
  CelestialPoints: Record<string, PointInfo>;
  Houses: HouseInfo[];
  Aspects: { all: AspectInfo[] };
}

// ---------- Traduções ----------
export const SIGN_LABELS_PT: Record<string, string> = {
  aries: "Áries",
  taurus: "Touro",
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes",
};

export const SIGN_GLYPHS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

export const PLANET_LABELS_PT: Record<string, string> = {
  sun: "Sol",
  moon: "Lua",
  mercury: "Mercúrio",
  venus: "Vênus",
  mars: "Marte",
  jupiter: "Júpiter",
  saturn: "Saturno",
  uranus: "Urano",
  neptune: "Netuno",
  pluto: "Plutão",
  northnode: "Nodo Norte",
};

export const PLANET_GLYPHS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  northnode: "☊",
};

export const ASPECT_LABELS_PT: Record<string, string> = {
  conjunction: "Conjunção",
  opposition: "Oposição",
  trine: "Trígono",
  square: "Quadratura",
  sextile: "Sextil",
  quincunx: "Quincúncio",
};

const BODY_ORDER = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

export interface ChartPoint {
  key: string;
  label: string;
  glyph: string;
  sign: string;
  signLabel: string;
  signGlyph: string;
  degreeInSign: number; // 0-30
  houseId: number | null;
  retrograde: boolean;
}

export interface ChartHouse {
  id: number;
  sign: string;
  signLabel: string;
  startDegreeInSign: number;
  startDegreeAbsolute: number;
}

export interface ChartAspect {
  a: string;
  b: string;
  type: string;
  typeLabel: string;
  orb: number;
}

export interface NatalChart {
  ascendant: ChartPoint;
  midheaven: ChartPoint;
  planets: ChartPoint[];
  points: ChartPoint[];
  houses: ChartHouse[];
  aspects: ChartAspect[];
}

export interface BirthInput {
  year: number;
  month: number; // 1-12 (humano; convertido internamente)
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
}

function toChartPoint(
  key: string,
  label: string,
  sign: SignInfo,
  chartPosition: ChartPos,
  houseId: number | null,
  retrograde: boolean
): ChartPoint {
  const abs = chartPosition.Ecliptic.DecimalDegrees;
  return {
    key,
    label,
    glyph: PLANET_GLYPHS[key] ?? "",
    sign: sign.key,
    signLabel: SIGN_LABELS_PT[sign.key] ?? sign.label,
    signGlyph: SIGN_GLYPHS[sign.key] ?? "",
    degreeInSign: Math.round((abs % 30) * 10) / 10,
    houseId,
    retrograde,
  };
}

export function computeNatalChart(input: BirthInput): NatalChart {
  const origin = new Origin({
    year: input.year,
    month: input.month - 1, // a lib usa 0 = janeiro
    date: input.day,
    hour: input.hour,
    minute: input.minute,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "angles"],
    aspectWithPoints: ["bodies", "angles"],
    aspectTypes: ["major"],
    language: "en",
  });

  const ascendant = toChartPoint(
    "ascendant",
    "Ascendente",
    horoscope.Ascendant.Sign,
    horoscope.Ascendant.ChartPosition,
    null,
    false
  );
  const midheaven = toChartPoint(
    "midheaven",
    "Meio do Céu",
    horoscope.Midheaven.Sign,
    horoscope.Midheaven.ChartPosition,
    null,
    false
  );

  const planets: ChartPoint[] = BODY_ORDER.map((key) => {
    const body = horoscope.CelestialBodies[key];
    return toChartPoint(
      key,
      PLANET_LABELS_PT[key] ?? body.label,
      body.Sign,
      body.ChartPosition,
      body.House?.id ?? null,
      body.isRetrograde
    );
  });

  const northnode = horoscope.CelestialPoints.northnode;
  const points: ChartPoint[] = northnode
    ? [
        toChartPoint(
          "northnode",
          PLANET_LABELS_PT.northnode,
          northnode.Sign,
          northnode.ChartPosition,
          northnode.House?.id ?? null,
          false
        ),
      ]
    : [];

  const houses: ChartHouse[] = horoscope.Houses.map((h) => {
    const abs = h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    return {
      id: h.id,
      sign: h.Sign.key,
      signLabel: SIGN_LABELS_PT[h.Sign.key] ?? h.Sign.label,
      startDegreeInSign: Math.round((abs % 30) * 10) / 10,
      startDegreeAbsolute: abs,
    };
  });

  const seen = new Set<string>();
  const aspects: ChartAspect[] = [];
  for (const asp of horoscope.Aspects.all) {
    if (asp.point1Key === asp.point2Key) continue;
    const label = ASPECT_LABELS_PT[asp.aspectKey];
    if (!label) continue; // só aspectos maiores têm rótulo em pt
    const pairKey = [asp.point1Key, asp.point2Key].sort().join("-") + asp.aspectKey;
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);
    aspects.push({
      a: asp.point1Key,
      b: asp.point2Key,
      type: asp.aspectKey,
      typeLabel: label,
      orb: Math.round(asp.orb * 100) / 100,
    });
  }

  return { ascendant, midheaven, planets, points, houses, aspects };
}
