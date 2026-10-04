export type Cell = { q: number; r: number; camp: number };
const rotation = (q: number, r: number, k: number): [number, number] => {
  for (let i = 0; i < k; i++) [q, r] = [-r, q + r];
  return [q, r];
};
export const cells: Cell[] = (() => {
  const a: Cell[] = [];
  for (let q = -4; q <= 4; q++)
    for (let r = -4; r <= 4; r++)
      if (Math.abs(q + r) <= 4) a.push({ q, r, camp: -1 });
  for (let camp = 0; camp < 6; camp++)
    for (let r = -8; r <= -5; r++)
      for (let q = -r - 4; q <= 4; q++) {
        const [x, y] = rotation(q, r, camp);
        a.push({ q: x, r: y, camp });
      }
  return a;
})();
export const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];
const at = (q: number, r: number) =>
  cells.findIndex((c) => c.q === q && c.r === r);
export type State = {
  board: number[];
  camps: number[];
  turn: number;
  winner: number | null;
  ply: number;
  history: string[];
  draw: boolean;
};
export function initial(n: number): State {
  const camps =
    n === 2
      ? [0, 3]
      : n === 3
        ? [0, 2, 4]
        : n === 4
          ? [0, 1, 3, 4]
          : [0, 1, 2, 3, 4, 5];
  return {
    camps,
    board: cells.map((c) =>
      camps.includes(c.camp) ? camps.indexOf(c.camp) : -1,
    ),
    turn: 0,
    winner: null,
    ply: 0,
    history: [],
    draw: false,
  };
}
export function destinations(s: State, from: number) {
  if (s.board[from] !== s.turn) return [];
  const result = new Set<number>(),
    seen = new Set([from]),
    queue = [from];
  const target = (s.camps[s.turn] + 3) % 6;
  const allowed = (i: number) =>
    i >= 0 &&
    s.board[i] === -1 &&
    (cells[from].camp !== target || cells[i].camp === target);
  const c = cells[from];
  for (const [dq, dr] of directions) {
    const i = at(c.q + dq, c.r + dr);
    if (allowed(i)) result.add(i);
  }
  while (queue.length) {
    const k = queue.pop()!,
      c = cells[k];
    for (const [dq, dr] of directions) {
      const over = at(c.q + dq, c.r + dr),
        i = at(c.q + dq * 2, c.r + dr * 2);
      if (
        over >= 0 &&
        over !== from &&
        s.board[over] !== -1 &&
        allowed(i) &&
        !seen.has(i)
      ) {
        seen.add(i);
        result.add(i);
        queue.push(i);
      }
    }
  }
  return [...result];
}
export function move(s: State, from: number, to: number): State {
  if (s.winner !== null || s.draw || !destinations(s, from).includes(to))
    return s;
  const x = structuredClone(s);
  x.board[to] = x.turn;
  x.board[from] = -1;
  const target = (x.camps[x.turn] + 3) % 6;
  // Anti-blocking: a full goal camp wins if it contains at least one own marble; opponents cannot squat forever.
  if (
    cells.every((c, i) => c.camp !== target || x.board[i] !== -1) &&
    cells.some((c, i) => c.camp === target && x.board[i] === x.turn)
  )
    x.winner = x.turn;
  x.turn = (x.turn + 1) % x.camps.length;
  x.ply++;
  const key = x.board.join(",") + "/" + x.turn;
  x.history.push(key);
  x.draw = x.history.filter((k) => k === key).length >= 3 || x.ply >= 600;
  return x;
}
export function automatic(s: State): State {
  const goal = cells.filter((c) => c.camp === (s.camps[s.turn] + 3) % 6),
    center = {
      q: goal.reduce((v, c) => v + c.q, 0) / 10,
      r: goal.reduce((v, c) => v + c.r, 0) / 10,
    };
  const distance = (i: number) =>
    Math.hypot(cells[i].q - center.q, (cells[i].r - center.r) * 1.15);
  let best = s,
    score = -Infinity;
  for (let a = 0; a < s.board.length; a++)
    if (s.board[a] === s.turn)
      for (const b of destinations(s, a)) {
        const x = move(s, a, b),
          v =
            x.winner === s.turn
              ? 1e5
              : (distance(a) - distance(b)) * 10 -
                distance(b) * 0.15 -
                (s.history.includes(x.board.join(",") + "/" + x.turn) ? 30 : 0);
        if (v > score) {
          score = v;
          best = x;
        }
      }
  if (best === s)
    return {
      ...s,
      turn: (s.turn + 1) % s.camps.length,
      ply: s.ply + 1,
      draw: s.ply >= 599,
    };
  return best;
}
