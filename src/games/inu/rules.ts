export type State = {
  n: number;
  secret: number | null;
  candidates: number[];
  turn: number;
  phase: "hide" | "seek";
  clues: { type: string; value: number; answer: boolean }[];
  attempts: number;
  winner: number | null;
  limit: number;
};
export const initial = (n: number): State => ({
  n,
  secret: null,
  candidates: Array.from({ length: n * n }, (_, i) => i),
  turn: 0,
  phase: "hide",
  clues: [],
  attempts: 0,
  winner: null,
  limit: Math.ceil(Math.log2(n * n)) + 2,
});
export const matches = (i: number, n: number, type: string, value: number) =>
  type === "row"
    ? Math.floor(i / n) <= value
    : type === "column"
      ? i % n <= value
      : (Math.floor(i / n) + (i % n)) % 2 === value;
export function hide(s: State, i: number): State {
  return s.phase === "hide" && i >= 0 && i < s.n * s.n
    ? { ...s, secret: i, phase: "seek", turn: 1 }
    : s;
}
export function ask(s: State, type: string, value: number): State {
  if (
    s.phase !== "seek" ||
    s.winner !== null ||
    s.secret === null ||
    !["row", "column", "parity"].includes(type) ||
    value < 0 ||
    value >= (type === "parity" ? 2 : s.n)
  )
    return s;
  const answer = matches(s.secret, s.n, type, value),
    attempts = s.attempts + 1;
  return {
    ...s,
    clues: [...s.clues, { type, value, answer }],
    attempts,
    candidates: s.candidates.filter(
      (i) => matches(i, s.n, type, value) === answer,
    ),
    winner: attempts >= s.limit ? 0 : null,
  };
}
export function guess(s: State, i: number): State {
  return s.phase === "seek" && s.winner === null && s.candidates.includes(i)
    ? {
        ...s,
        attempts: s.attempts + 1,
        winner: i === s.secret ? 1 : s.attempts + 1 >= s.limit ? 0 : null,
        candidates: i === s.secret ? [i] : s.candidates.filter((c) => c !== i),
      }
    : s;
}
export function automatic(s: State): State {
  if (s.phase === "hide") return hide(s, Math.floor(Math.random() * s.n * s.n));
  if (s.candidates.length === 1 || s.attempts === s.limit - 1)
    return guess(s, s.candidates[0]);
  let best: { type: string; value: number } | null = null,
    score = Infinity;
  for (const type of ["row", "column", "parity"])
    for (let value = 0; value < (type === "parity" ? 2 : s.n); value++) {
      const count = s.candidates.filter((i) =>
          matches(i, s.n, type, value),
        ).length,
        v = Math.abs(count - s.candidates.length / 2);
      if (count && count < s.candidates.length && v < score) {
        score = v;
        best = { type, value };
      }
    }
  return best ? ask(s, best.type, best.value) : guess(s, s.candidates[0]);
}
