import { TAROT_DECK } from "./tarot-data";

const SPREAD_SIZES = {
  single: 1,
  three: 3,
  "celtic-cross": 10,
} as const;

export type SpreadType = keyof typeof SPREAD_SIZES;

export function drawRandomCards(spread: SpreadType): {
  cardIds: number[];
  reversed: boolean[];
} {
  const size = SPREAD_SIZES[spread];
  const pool = TAROT_DECK.map((c) => c.id);
  const cardIds: number[] = [];
  for (let i = 0; i < size; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    cardIds.push(pool[idx]);
    pool.splice(idx, 1);
  }
  const reversed = cardIds.map(() => Math.random() < 0.35);
  return { cardIds, reversed };
}

export const THREE_CARD_POSITIONS = ["Passado", "Presente", "Futuro"];
