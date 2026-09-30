export type State = { pits: number[]; turn: 1 | 2; over: boolean };
export const initial = (): State => ({
  pits: Array.from({ length: 14 }, (_, i) => (i === 6 || i === 13 ? 0 : 4)),
  turn: 1,
  over: false,
});
export const legal = (s: State) =>
  s.over
    ? []
    : Array.from({ length: 6 }, (_, i) => i + (s.turn === 1 ? 0 : 7)).filter(
        (i) => s.pits[i] > 0,
      );
export function sow(s: State, pit: number): State | null {
  if (!legal(s).includes(pit)) return null;
  const pits = [...s.pits],
    own = s.turn === 1 ? 6 : 13,
    opponent = s.turn === 1 ? 13 : 6;
  let stones = pits[pit],
    i = pit;
  pits[pit] = 0;
  while (stones) {
    i = (i + 1) % 14;
    if (i === opponent) continue;
    pits[i]++;
    stones--;
  }
  if (
    i !== own &&
    (s.turn === 1 ? i < 6 : i > 6 && i < 13) &&
    pits[i] === 1 &&
    pits[12 - i] > 0
  ) {
    pits[own] += pits[12 - i] + 1;
    pits[12 - i] = 0;
    pits[i] = 0;
  }
  const ended =
    pits.slice(0, 6).every((v) => !v) || pits.slice(7, 13).every((v) => !v);
  if (ended) {
    pits[6] += pits.slice(0, 6).reduce((a, b) => a + b, 0);
    pits[13] += pits.slice(7, 13).reduce((a, b) => a + b, 0);
    for (let j = 0; j < 14; j++) if (j !== 6 && j !== 13) pits[j] = 0;
  }
  return { pits, turn: i === own ? s.turn : s.turn === 1 ? 2 : 1, over: ended };
}
export function bestMove(s: State, depth = 6): number {
  function search(state: State, d: number, a: number, b: number): number {
    if (!d || state.over)
      return (
        (state.pits[13] - state.pits[6]) * (state.over ? 100 : 10) +
        state.pits.slice(7, 13).reduce((a, b) => a + b, 0) -
        state.pits.slice(0, 6).reduce((a, b) => a + b, 0)
      );
    let best = state.turn === 2 ? -Infinity : Infinity;
    for (const pit of legal(state)) {
      const score = search(sow(state, pit)!, d - 1, a, b);
      if (state.turn === 2) {
        best = Math.max(best, score);
        a = Math.max(a, best);
      } else {
        best = Math.min(best, score);
        b = Math.min(b, best);
      }
      if (a >= b) break;
    }
    return best;
  }
  let chosen = -1,
    score = s.turn === 2 ? -Infinity : Infinity;
  for (const pit of legal(s)) {
    const n = search(sow(s, pit)!, depth - 1, -Infinity, Infinity);
    if (s.turn === 2 ? n > score : n < score) {
      score = n;
      chosen = pit;
    }
  }
  return chosen;
}
