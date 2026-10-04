export type State = {
  levels: number[];
  workers: number[][];
  turn: number;
  phase: "place" | "move" | "build";
  builder: number;
  winner: number | null;
  ply: number;
};
export const initial = (): State => ({
  levels: Array(25).fill(0),
  workers: [[], []],
  turn: 0,
  phase: "place",
  builder: -1,
  winner: null,
  ply: 0,
});
export const near = (a: number, b: number) =>
  a !== b &&
  Math.abs((a % 5) - (b % 5)) <= 1 &&
  Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) <= 1;
const empty = (s: State, i: number) =>
  i >= 0 && i < 25 && s.levels[i] < 4 && !s.workers.flat().includes(i);
export function moves(s: State, from: number) {
  return s.workers[s.turn].includes(from)
    ? s.levels
        .map((_, i) => i)
        .filter(
          (i) =>
            near(from, i) &&
            empty(s, i) &&
            s.levels[i] <= s.levels[from] + 1 &&
            ((s.levels[from] === 2 && s.levels[i] === 3) ||
              builds(
                {
                  ...s,
                  workers: s.workers.map((w, p) =>
                    p === s.turn ? w.map((v) => (v === from ? i : v)) : w,
                  ),
                },
                i,
              ).length > 0),
        )
    : [];
}
export function builds(s: State, from: number) {
  return s.levels.map((_, i) => i).filter((i) => near(from, i) && empty(s, i));
}
export function place(s: State, i: number): State {
  if (s.phase !== "place" || s.winner !== null || !empty(s, i)) return s;
  const x = structuredClone(s);
  x.workers[x.turn].push(i);
  if (x.workers[x.turn].length === 2) x.turn = 1 - x.turn;
  if (x.workers.flat().length === 4) {
    x.phase = "move";
    x.turn = 0;
  }
  return x;
}
export function walk(s: State, from: number, to: number): State {
  if (s.phase !== "move" || s.winner !== null || !moves(s, from).includes(to))
    return s;
  const x = structuredClone(s);
  x.workers[x.turn] = x.workers[x.turn].map((v) => (v === from ? to : v));
  if (s.levels[from] === 2 && s.levels[to] === 3) x.winner = x.turn;
  else {
    x.phase = "build";
    x.builder = to;
  }
  return x;
}
export function build(s: State, i: number): State {
  if (
    s.phase !== "build" ||
    s.winner !== null ||
    !builds(s, s.builder).includes(i)
  )
    return s;
  const x = structuredClone(s);
  x.levels[i]++;
  x.turn = 1 - x.turn;
  x.phase = "move";
  x.ply++;
  if (!x.workers[x.turn].some((w) => moves(x, w).length)) x.winner = 1 - x.turn;
  return x;
}
export function automatic(s: State): State {
  if (s.phase === "place") {
    const list = [12, 6, 18, 8, 16, 11, 13, ...s.levels.map((_, i) => i)];
    return place(s, list.find((i) => empty(s, i))!);
  }
  if (s.phase === "build") {
    const options = builds(s, s.builder).sort((a, b) => {
      const danger = (i: number) =>
        s.levels[i] === 2 &&
        s.workers[1 - s.turn].some((w) => near(w, i) && s.levels[w] === 2);
      return +danger(a) - +danger(b) || s.levels[b] - s.levels[a];
    });
    return build(s, options[0]);
  }
  let best: State = s,
    value = -Infinity;
  for (const w of s.workers[s.turn])
    for (const to of moves(s, w)) {
      const x = walk(s, w, to),
        score =
          x.winner === s.turn
            ? 10000
            : s.levels[to] * 10 +
              builds(x, to).length -
              Math.abs((to % 5) - 2) -
              Math.abs(Math.floor(to / 5) - 2);
      if (score > value) {
        value = score;
        best = x;
      }
    }
  return best;
}
