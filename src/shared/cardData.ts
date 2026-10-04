import {
  deck,
  spanishDeck,
  shuffled,
  label,
  rank,
  suits,
  spanishSuits,
  type Card,
} from "./cards";
import type { DisplayCard } from "./CardTable";
export { deck, spanishDeck, shuffled, label, type Card };
export const clone = <T>(s: T): T => structuredClone(s);
export const high = (c: Card) => (c.rank === 1 ? 14 : c.rank);
export const points = (c: Card) =>
  c.rank === 1
    ? 11
    : c.rank === 3
      ? 10
      : c.rank === 12
        ? 4
        : c.rank === 11
          ? 3
          : c.rank === 10
            ? 2
            : 0;
export const display = (
  c: Card,
  key: string,
  action?: string,
  spanish = false,
): DisplayCard => ({
  key,
  action,
  label: label(c, spanish),
  rank: spanish ? String(c.rank) : rank(c.rank),
  suit: spanish ? ["◉", "♜", "⚔", "♣"][c.suit] || "★" : suits[c.suit] || "★",
  red: spanish ? c.suit === 0 || c.suit === 1 : c.suit === 1 || c.suit === 2,
});
export const suitName = (s: number, spanish = false) =>
  spanish
    ? spanishSuits[s]
    : ["picas", "corazones", "diamantes", "tréboles"][s];
export const deal = (cards: Card[], n: number, count: number) =>
  Array.from({ length: n }, () => cards.splice(0, count));
export const best = (scores: number[], low = false) => {
  const v = low ? Math.min(...scores) : Math.max(...scores),
    w = scores.flatMap((s, i) => (s === v ? [i] : []));
  return w.length === 1 ? w[0] : -1;
};
/** All non-overlapping natural sets/runs in a small hand, used by rummy solvers. */
export function meldMasks(hand: Card[], spanish = false): number[] {
  const masks: number[] = [];
  const ranks = spanish
    ? [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
    : Array.from({ length: 13 }, (_, i) => i + 1);
  const add = (is: number[]) => {
    if (is.length >= 3) masks.push(is.reduce((m, i) => m | (2 ** i), 0));
  };
  for (const r of ranks) {
    const is = hand.flatMap((c, i) => (c.rank === r ? [i] : []));
    for (let m = 1; m < 2 ** is.length; m++) {
      const x = is.filter((_, j) => m & (2 ** j));
      add(x);
    }
  }
  for (let s = 0; s < 4; s++)
    for (let start = 0; start < ranks.length; start++) {
      const is: number[] = [];
      for (let end = start; end < ranks.length; end++) {
        const i = hand.findIndex((c) => c.suit === s && c.rank === ranks[end]);
        if (i < 0) break;
        is.push(i);
        add([...is]);
      }
    }
  return [...new Set(masks)];
}
export function deadwood(hand: Card[], spanish = false) {
  const masks = meldMasks(hand, spanish),
    full = 2 ** hand.length - 1,
    memo = new Map<number, { value: number; groups: number[] }>();
  const solve = (left: number): { value: number; groups: number[] } => {
    const old = memo.get(left);
    if (old) return old;
    let out = {
      value: hand.reduce(
        (v, c, i) => v + (left & (2 ** i) ? Math.min(c.rank, 10) : 0),
        0,
      ),
      groups: [] as number[],
    };
    for (const m of masks)
      if ((left & m) === m) {
        const x = solve(left ^ m);
        if (x.value < out.value)
          out = { value: x.value, groups: [m, ...x.groups] };
      }
    memo.set(left, out);
    return out;
  };
  return solve(full);
}
