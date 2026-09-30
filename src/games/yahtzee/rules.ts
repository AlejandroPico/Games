export const categories = [
  "Unos",
  "Doses",
  "Treses",
  "Cuatros",
  "Cincos",
  "Seises",
  "Trío",
  "Póker",
  "Full",
  "Escalera corta",
  "Escalera larga",
  "Yahtzee",
  "Azar",
];
export type State = {
  dice: number[];
  held: boolean[];
  rolls: number;
  turn: number;
  sheets: (number | null)[][];
  bonuses: number[];
};
export const initial = (players = 1): State => ({
  dice: [1, 2, 3, 4, 5],
  held: Array(5).fill(false),
  rolls: 0,
  turn: 0,
  sheets: Array.from({ length: players }, () => Array(13).fill(null)),
  bonuses: Array(players).fill(0),
});
export function roll(s: State, random = Math.random): State | null {
  if (s.rolls >= 3 || finished(s)) return null;
  return {
    ...s,
    dice: s.dice.map((v, i) =>
      s.held[i] && s.rolls ? v : 1 + Math.floor(random() * 6),
    ),
    rolls: s.rolls + 1,
  };
}
export function value(dice: number[], category: number, joker = false): number {
  const counts = Array.from(
      { length: 6 },
      (_, i) => dice.filter((v) => v === i + 1).length,
    ),
    sum = dice.reduce((a, b) => a + b, 0),
    unique = [...new Set(dice)].sort();
  if (category < 6) return counts[category] * (category + 1);
  if (category === 6) return Math.max(...counts) >= 3 ? sum : 0;
  if (category === 7) return Math.max(...counts) >= 4 ? sum : 0;
  if (category === 8)
    return joker || (counts.includes(3) && counts.includes(2)) ? 25 : 0;
  if (category === 9)
    return joker ||
      [1, 2, 3].some((n) =>
        [n, n + 1, n + 2, n + 3].every((v) => unique.includes(v)),
      )
      ? 30
      : 0;
  if (category === 10)
    return joker || (unique.length === 5 && unique[4] - unique[0] === 4)
      ? 40
      : 0;
  if (category === 11) return counts.includes(5) ? 50 : 0;
  return sum;
}
export function choices(s: State): number[] {
  if (!s.rolls || finished(s)) return [];
  const sheet = s.sheets[s.turn],
    open = sheet.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0),
    joker = s.dice.every((v) => v === s.dice[0]) && sheet[11] !== null;
  if (joker) {
    const upper = s.dice[0] - 1;
    if (sheet[upper] === null) return [upper];
    const lower = open.filter((i) => i >= 6);
    if (lower.length) return lower;
  }
  return open;
}
export function score(s: State, category: number): State | null {
  if (!choices(s).includes(category)) return null;
  const sheets = s.sheets.map((h) => [...h]),
    bonuses = [...s.bonuses],
    joker = s.dice.every((v) => v === s.dice[0]) && sheets[s.turn][11] !== null;
  if (joker && sheets[s.turn][11] === 50) bonuses[s.turn] += 100;
  sheets[s.turn][category] = value(s.dice, category, joker);
  return {
    ...s,
    sheets,
    bonuses,
    turn: (s.turn + 1) % s.sheets.length,
    rolls: 0,
    held: Array(5).fill(false),
  };
}
export const finished = (s: State) =>
  s.sheets.every((h) => h.every((v) => v !== null));
export const total = (s: State, p: number) =>
  s.sheets[p].reduce<number>((n, v) => n + (v || 0), 0) +
  (s.sheets[p].slice(0, 6).reduce<number>((n, v) => n + (v || 0), 0) >= 63
    ? 35
    : 0) +
  s.bonuses[p];
export function aiHolds(s: State): boolean[] {
  const sheet = s.sheets[s.turn],
    counts = Array.from(
      { length: 6 },
      (_, i) => s.dice.filter((v) => v === i + 1).length,
    ),
    target =
      counts.reduce(
        (best, n, i) =>
          n > counts[best] || (n === counts[best] && i > best) ? i : best,
        0,
      ) + 1;
  if (sheet[10] === null && new Set(s.dice).size >= 4) {
    const seen = new Set<number>();
    return s.dice.map((v) => {
      const hold = !seen.has(v);
      seen.add(v);
      return hold;
    });
  }
  return s.dice.map((v) => v === target);
}
export function aiCategory(s: State): number {
  const joker =
    s.dice.every((v) => v === s.dice[0]) && s.sheets[s.turn][11] !== null;
  return choices(s).sort((a, b) => {
    const quality = (i: number) => {
      const v = value(s.dice, i, joker);
      return i < 6
        ? v / (3 * (i + 1))
        : i === 11
          ? (v / 50) * 1.7
          : v / [0, 0, 0, 0, 0, 0, 25, 26, 25, 30, 40, 50, 24][i];
    };
    return quality(b) - quality(a);
  })[0];
}
