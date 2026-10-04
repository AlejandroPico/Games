import { shuffled } from "../../shared/cards";
export const plots = (() => {
  const a: { q: number; r: number; pip: number; terrain: number }[] = [];
  for (let r = -2; r <= 2; r++)
    for (let q = -2; q <= 2; q++)
      if (Math.abs(q + r) <= 2)
        a.push({ q, r, pip: (a.length % 6) + 1, terrain: a.length % 6 });
  return a;
})();
export const terrainNames = [
  "Castillo",
  "Pradera",
  "Mina",
  "Villa",
  "Río",
  "Monasterio",
];
export type Estate = {
  board: number[];
  reserve: number[];
  workers: number;
  score: number;
};
export type State = {
  estates: Estate[];
  market: number[][];
  dice: number[];
  turn: number;
  round: number;
  ply: number;
  winner: number[] | null;
};
const refill = () =>
  Array.from({ length: 6 }, (_, i) => shuffled([i, (i + 1) % 6, (i + 3) % 6]));
export function initial(n: number): State {
  return {
    estates: Array.from({ length: n }, () => ({
      board: plots.map((_, i) => (i === 9 ? 0 : -1)),
      reserve: [],
      workers: 3,
      score: 0,
    })),
    market: refill(),
    dice: [
      1 + Math.floor(Math.random() * 6),
      1 + Math.floor(Math.random() * 6),
    ],
    turn: 0,
    round: 1,
    ply: 0,
    winner: null,
  };
}
const near = (a: number, b: number) => {
  const p = plots[a],
    q = plots[b],
    x = p.q - q.q,
    y = p.r - q.r;
  return Math.max(Math.abs(x), Math.abs(y), Math.abs(x + y)) === 1;
};
export function legalPlace(
  s: State,
  reserve: number,
  cell: number,
  die: number,
) {
  const e = s.estates[s.turn],
    p = plots[cell],
    tile = e.reserve[reserve];
  return (
    !!p &&
    tile !== undefined &&
    e.board[cell] === -1 &&
    (cell === 9 || p.terrain === tile) &&
    e.board.some((v, i) => v >= 0 && near(cell, i)) &&
    die >= 0 &&
    die < s.dice.length &&
    Math.abs(s.dice[die] - p.pip) <= e.workers
  );
}
export function act(
  s: State,
  action: "take" | "place" | "workers",
  die: number,
  index = 0,
  cell = 0,
): State {
  if (s.winner || die < 0 || die >= s.dice.length) return s;
  const x = structuredClone(s),
    e = x.estates[x.turn];
  if (action === "take") {
    const depot = x.dice[die] - 1;
    if (e.reserve.length >= 3 || x.market[depot][index] === undefined) return s;
    e.reserve.push(x.market[depot].splice(index, 1)[0]);
  } else if (action === "workers") e.workers += 2;
  else {
    if (!legalPlace(s, index, cell, die)) return s;
    e.workers -= Math.abs(x.dice[die] - plots[cell].pip);
    const tile = e.reserve.splice(index, 1)[0];
    e.board[cell] = tile;
    e.score +=
      tile === 0
        ? 4
        : tile === 1
          ? 3
          : tile === 2
            ? 2
            : tile === 3
              ? 4
              : tile === 4
                ? 2
                : 5;
    if (tile === 2) e.workers += 2;
    if (tile === 4) e.score += e.board.filter((v) => v === 4).length;
    if (plots.every((p, i) => p.terrain !== tile || e.board[i] >= 0))
      e.score += 8;
  }
  x.dice.splice(die, 1);
  x.ply++;
  if (!x.dice.length) {
    x.turn = (x.turn + 1) % x.estates.length;
    if (x.turn === 0) {
      x.round++;
      x.estates.forEach(
        (e) => (e.score += e.board.filter((v) => v === 2).length),
      );
      x.market = refill();
    }
    x.dice = [
      1 + Math.floor(Math.random() * 6),
      1 + Math.floor(Math.random() * 6),
    ];
  }
  if (x.round > 10 || e.board.every((v) => v >= 0)) {
    const result = x.estates.map((e) => e.score + e.workers),
      max = Math.max(...result);
    x.winner = result.flatMap((v, i) => (v === max ? [i] : []));
  }
  return x;
}
export function automatic(s: State): State {
  const e = s.estates[s.turn];
  for (let d = 0; d < s.dice.length; d++)
    for (let i = 0; i < e.reserve.length; i++)
      for (let cell = 0; cell < plots.length; cell++)
        if (legalPlace(s, i, cell, d)) return act(s, "place", d, i, cell);
  if (e.reserve.length < 3) {
    for (let d = 0; d < s.dice.length; d++) {
      const depot = s.dice[d] - 1,
        index = s.market[depot].findIndex((t) =>
          plots.some((p, i) => e.board[i] < 0 && p.terrain === t),
        );
      if (index >= 0) return act(s, "take", d, index);
    }
  }
  return act(s, "workers", 0);
}
