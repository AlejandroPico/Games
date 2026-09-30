export type Player = 1 | 2;
export type State = {
  size: number;
  board: number[];
  turn: Player;
  history: string[];
  passes: number;
  captured: [number, number];
  phase: "play" | "scoring" | "over";
  last: number | null;
};
export const initial = (size = 9): State => ({
  size,
  board: Array(size * size).fill(0),
  turn: 1,
  history: [
    Array(size * size)
      .fill(0)
      .join(""),
  ],
  passes: 0,
  captured: [0, 0],
  phase: "play",
  last: null,
});
export function neighbors(i: number, n: number) {
  const r = Math.floor(i / n),
    c = i % n;
  return [
    r > 0 ? i - n : -1,
    r < n - 1 ? i + n : -1,
    c > 0 ? i - 1 : -1,
    c < n - 1 ? i + 1 : -1,
  ].filter((v) => v >= 0);
}
export function group(board: number[], index: number, n: number) {
  const color = board[index],
    stones = new Set<number>(),
    liberties = new Set<number>();
  if (!color) return { stones, liberties };
  const todo = [index];
  while (todo.length) {
    const i = todo.pop()!;
    if (stones.has(i)) continue;
    stones.add(i);
    for (const j of neighbors(i, n)) {
      if (!board[j]) liberties.add(j);
      else if (board[j] === color && !stones.has(j)) todo.push(j);
    }
  }
  return { stones, liberties };
}
export function play(s: State, i: number): State | null {
  if (s.phase !== "play" || i < 0 || i >= s.board.length || s.board[i])
    return null;
  const board = [...s.board];
  board[i] = s.turn;
  let captures = 0;
  for (const j of neighbors(i, s.size)) {
    if (board[j] === 3 - s.turn) {
      const g = group(board, j, s.size);
      if (!g.liberties.size) {
        g.stones.forEach((k) => (board[k] = 0));
        captures += g.stones.size;
      }
    }
  }
  if (!group(board, i, s.size).liberties.size) return null;
  const key = board.join("");
  if (s.history.includes(key)) return null;
  const captured = [...s.captured] as [number, number];
  captured[s.turn - 1] += captures;
  return {
    ...s,
    board,
    turn: (3 - s.turn) as Player,
    history: [...s.history, key],
    passes: 0,
    captured,
    last: i,
  };
}
export const pass = (s: State): State =>
  s.phase !== "play"
    ? s
    : {
        ...s,
        turn: (3 - s.turn) as Player,
        passes: s.passes + 1,
        phase: s.passes === 1 ? "scoring" : "play",
        last: null,
      };
export function score(s: State, dead: number[] = [], komi = 7.5) {
  const board = s.board.map((v, i) => (dead.includes(i) ? 0 : v)),
    seen = new Set<number>(),
    territory = Array(board.length).fill(0),
    points: [number, number] = [
      board.filter((v) => v === 1).length,
      board.filter((v) => v === 2).length + komi,
    ];
  for (let i = 0; i < board.length; i++) {
    if (board[i] || seen.has(i)) continue;
    const area: number[] = [],
      colors = new Set<number>(),
      todo = [i];
    while (todo.length) {
      const j = todo.pop()!;
      if (seen.has(j)) continue;
      seen.add(j);
      area.push(j);
      for (const k of neighbors(j, s.size)) {
        if (board[k]) colors.add(board[k]);
        else if (!seen.has(k)) todo.push(k);
      }
    }
    if (colors.size === 1) {
      const owner = [...colors][0];
      points[owner - 1] += area.length;
      area.forEach((j) => (territory[j] = owner));
    }
  }
  return { points, territory };
}
function eye(s: State, i: number) {
  const adj = neighbors(i, s.size);
  return adj.every((j) => s.board[j] === s.turn) && adj.length >= 2;
}
function value(s: State, i: number, next: State) {
  const before = s.captured[s.turn - 1],
    after = next.captured[s.turn - 1],
    g = group(next.board, i, s.size);
  let v = (after - before) * 18 + Math.min(g.liberties.size, 5) * 2;
  for (const j of neighbors(i, s.size)) {
    if (s.board[j] === s.turn && group(s.board, j, s.size).liberties.size === 1)
      v += 12;
    if (
      s.board[j] === 3 - s.turn &&
      group(next.board, j, s.size).liberties.size === 1
    )
      v += 7;
  }
  const r = Math.floor(i / s.size),
    c = i % s.size,
    edge = Math.min(r, c, s.size - 1 - r, s.size - 1 - c);
  v +=
    s.history.length < 14
      ? edge === 2
        ? 5
        : edge === 3
          ? 4
          : edge === 0
            ? -4
            : 1
      : 0;
  return v;
}
export function bestMove(s: State): number | null {
  if (s.phase !== "play") return null;
  const candidates = s.board
    .flatMap((v, i) => {
      if (v || eye(s, i)) return [];
      const next = play(s, i);
      return next ? [{ i, next, value: value(s, i, next) }] : [];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
  if (!candidates.length) return null;
  // Bounded Monte Carlo lookahead complements capture/liberty and opening heuristics.
  const limit = performance.now() + 550;
  let best = candidates[0].i,
    bestValue = -Infinity;
  for (const c of candidates) {
    let total = 0,
      count = 0;
    for (let run = 0; run < 8 && performance.now() < limit; run++) {
      let state = c.next;
      for (
        let ply = 0;
        ply < Math.min(s.size * s.size, 70) && state.phase === "play";
        ply++
      ) {
        let chosen: State | null = null;
        for (let tries = 0; tries < 12; tries++) {
          const i = Math.floor(Math.random() * state.board.length);
          if (!state.board[i] && !eye(state, i)) {
            chosen = play(state, i);
            if (chosen) break;
          }
        }
        state = chosen || pass(state);
      }
      const result = score(state).points;
      total += s.turn === 1 ? result[0] - result[1] : result[1] - result[0];
      count++;
    }
    const v = c.value + (count ? total / count : 0) * 0.22;
    if (v > bestValue) {
      bestValue = v;
      best = c.i;
    }
  }
  return best;
}
