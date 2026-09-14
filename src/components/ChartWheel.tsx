import type { NatalChart } from "@/lib/astrology";
import { SIGN_GLYPHS } from "@/lib/astrology";

const SIGN_ORDER = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const CX = 160;
const CY = 160;
const R_ZODIAC = 148;
const R_TICK = 132;
const R_GLYPH = 116;
const R_HOUSE = 96;
const R_PLANET = 78;
const R_ASPECT = 60;

// Ângulo de tela (graus, 0 = direita/3h, sentido horário) para um grau
// absoluto do zodíaco, rotacionado para o Ascendente ficar à esquerda (9h) —
// convenção padrão de mapas astrais, com os signos correndo em sentido
// anti-horário a partir do Ascendente.
function screenAngle(absoluteDegree: number, ascendantDegree: number): number {
  return 180 - (absoluteDegree - ascendantDegree);
}

function point(radius: number, angleDeg: number, cx = CX, cy = CY) {
  const rad = (angleDeg * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)] as const;
}

export function ChartWheel({ chart }: { chart: NatalChart }) {
  const ascDeg =
    chart.ascendant.sign && chart.houses.length
      ? chart.houses[0].startDegreeAbsolute
      : 0;

  const zodiacTicks = SIGN_ORDER.flatMap((sign, i) => {
    const marks = [];
    for (let sub = 0; sub < 3; sub++) {
      const deg = i * 30 + sub * 10;
      const a = screenAngle(deg, ascDeg);
      const [x1, y1] = point(R_ZODIAC, a);
      const [x2, y2] = point(R_TICK + (sub === 0 ? 0 : 8), a);
      marks.push(
        <line
          key={`${sign}-${sub}`}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--line)"
          strokeWidth={sub === 0 ? 1.2 : 0.6}
        />
      );
    }
    const glyphAngle = screenAngle(i * 30 + 15, ascDeg);
    const [gx, gy] = point(R_GLYPH, glyphAngle);
    marks.push(
      <text
        key={`${sign}-glyph`}
        x={gx} y={gy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fill="var(--ink-muted)"
      >
        {SIGN_GLYPHS[sign]}
      </text>
    );
    return marks;
  });

  const houseLines = chart.houses.map((h) => {
    const a = screenAngle(h.startDegreeAbsolute, ascDeg);
    const [x1, y1] = point(28, a);
    const [x2, y2] = point(R_HOUSE, a);
    const [lx, ly] = point(40, a);
    return (
      <g key={`house-${h.id}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth={h.id === 1 || h.id === 10 ? 1.4 : 0.5} />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-dim)">
          {h.id}
        </text>
      </g>
    );
  });

  const planetPositions = new Map<string, { x: number; y: number }>();

  const planetMarks = chart.planets.map((p) => {
    const absDeg = SIGN_ORDER.indexOf(p.sign) * 30 + p.degreeInSign;
    const a = screenAngle(absDeg, ascDeg);
    const [x, y] = point(R_PLANET, a);
    planetPositions.set(p.key, { x, y });
    const [ax, ay] = point(R_ASPECT, a);
    planetPositions.set(`${p.key}-aspect`, { x: ax, y: ay });
    return (
      <g key={p.key}>
        <circle cx={x} cy={y} r={9} fill="var(--surface)" stroke="var(--line)" strokeWidth={1} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="var(--accent)">
          {p.glyph}
        </text>
      </g>
    );
  });

  const aspectLines = chart.aspects
    .filter((asp) => planetPositions.has(`${asp.a}-aspect`) && planetPositions.has(`${asp.b}-aspect`))
    .map((asp, i) => {
      const p1 = planetPositions.get(`${asp.a}-aspect`)!;
      const p2 = planetPositions.get(`${asp.b}-aspect`)!;
      const color =
        asp.type === "trine" || asp.type === "sextile" ? "var(--good)" : "var(--accent-2)";
      return (
        <line
          key={i}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={color}
          strokeWidth={0.6}
          opacity={0.55}
        />
      );
    });

  const ascAngle = screenAngle(ascDeg, ascDeg);
  const [ascX1, ascY1] = point(20, ascAngle);
  const [ascX2, ascY2] = point(R_ZODIAC + 6, ascAngle);

  return (
    <svg viewBox="0 0 320 320" className="w-full h-auto" role="img" aria-label="Roda do mapa astral">
      <circle cx={CX} cy={CY} r={R_ZODIAC} fill="none" stroke="var(--line)" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={R_HOUSE} fill="none" stroke="var(--line)" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={R_ASPECT} fill="none" stroke="var(--line)" strokeWidth={0.6} />
      {zodiacTicks}
      {houseLines}
      {aspectLines}
      {planetMarks}
      <line x1={ascX1} y1={ascY1} x2={ascX2} y2={ascY2} stroke="var(--accent-2)" strokeWidth={1.6} />
      <text x={ascX2} y={ascY2} dx={-6} dy={-4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--accent-2)">
        ASC
      </text>
    </svg>
  );
}
