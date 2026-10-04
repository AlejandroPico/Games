const vertices = [
  [5, 0],
  [8, 0],
  [8, 5],
  [13, 5],
  [13, 8],
  [8, 8],
  [8, 13],
  [5, 13],
  [5, 8],
  [0, 8],
  [0, 5],
  [5, 5],
];
export const track = vertices.flatMap(([x, y], i) => {
  const [a, b] = vertices[(i + 1) % vertices.length],
    length = Math.abs(a - x) + Math.abs(b - y);
  return Array.from({ length }, (_, k) => [
    x + Math.sign(a - x) * k,
    y + Math.sign(b - y) * k,
  ]);
});
export type State = {
  pieces: number[][];
  turn: number;
  beans: number[];
  roll: number | null;
  winner: number | null;
  ply: number;
};
export const initial = (players: number): State => ({
  pieces: Array.from({ length: players }, () => Array(6).fill(-1)),
  turn: 0,
  beans: [],
  roll: null,
  winner: null,
  ply: 0,
});
export const position = (s: State, player: number, piece: number) =>
  (s.pieces[player][piece] + player * 13) % 52;
export function options(s: State) {
  if (s.roll === null || s.roll === 0 || s.winner !== null) return [];
  return s.pieces[s.turn]
    .map((v, i) => i)
    .filter((i) => {
      const v = s.pieces[s.turn][i],
        next = v < 0 ? (s.roll === 1 ? 0 : -1) : v + s.roll!;
      return (
        next >= 0 &&
        next <= 52 &&
        (next === 52 || !s.pieces[s.turn].some((p, k) => k !== i && p === next))
      );
    });
}
export function toss(s: State): State {
  if (s.roll !== null || s.winner !== null) return s;
  const beans = Array.from({ length: 5 }, () => (Math.random() < 0.5 ? 1 : 0)),
    count = beans.reduce<number>((a, b) => a + b, 0),
    x = { ...s, beans, roll: count === 5 ? 10 : count };
  if (!options(x).length)
    return {
      ...x,
      turn: (s.turn + 1) % s.pieces.length,
      roll: null,
      ply: s.ply + 1,
    };
  return x;
}
export function move(s: State, i: number): State {
  if (!options(s).includes(i)) return s;
  const x = structuredClone(s),
    old = x.pieces[x.turn][i],
    next = old < 0 ? 0 : old + x.roll!;
  x.pieces[x.turn][i] = next;
  if (next < 52) {
    const p = position(x, x.turn, i);
    if (p % 13 !== 0)
      x.pieces.forEach((row, j) => {
        if (j !== x.turn)
          row.forEach((v, k) => {
            if (v >= 0 && v < 52 && position(x, j, k) === p)
              x.pieces[j][k] = -1;
          });
      });
  }
  if (x.pieces[x.turn].every((v) => v === 52)) x.winner = x.turn;
  x.turn = (x.turn + 1) % x.pieces.length;
  x.roll = null;
  x.ply++;
  return x;
}
export function automatic(s: State): State {
  if (s.roll === null) return toss(s);
  const opts = options(s).sort(
    (a, b) => s.pieces[s.turn][b] - s.pieces[s.turn][a],
  );
  return opts.length ? move(s, opts[0]) : s;
}
