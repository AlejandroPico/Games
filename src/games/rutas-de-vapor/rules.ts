import { shuffled } from "../../shared/cards";
export const cities = [
  ["Faro", 12, 20],
  ["Robleda", 42, 12],
  ["Cumbre", 73, 17],
  ["Puerto", 91, 49],
  ["Villa", 64, 51],
  ["Lago", 35, 47],
  ["Valle", 12, 76],
  ["Sur", 64, 85],
] as const;
export const routes = [
  { a: 0, b: 1, n: 3, color: 0 },
  { a: 1, b: 2, n: 3, color: 1 },
  { a: 2, b: 3, n: 4, color: 2 },
  { a: 3, b: 7, n: 3, color: 3 },
  { a: 7, b: 6, n: 4, color: 0 },
  { a: 6, b: 0, n: 4, color: 1 },
  { a: 0, b: 5, n: 2, color: 2 },
  { a: 1, b: 5, n: 3, color: 3 },
  { a: 2, b: 4, n: 3, color: 0 },
  { a: 3, b: 4, n: 2, color: 1 },
  { a: 4, b: 5, n: 3, color: 2 },
  { a: 5, b: 6, n: 2, color: 3 },
  { a: 4, b: 7, n: 3, color: 3 },
  { a: 5, b: 7, n: 4, color: 1 },
];
export const colors = ["Rubí", "Ámbar", "Jade", "Zafiro", "Locomotora"];
export type State = {
  hands: number[][];
  stock: number[];
  discard: number[];
  market: number[];
  owners: number[];
  trains: number[];
  scores: number[];
  contracts: { a: number; b: number; points: number }[][];
  turn: number;
  draws: number;
  last: number | null;
  ply: number;
  winner: number[] | null;
};
export function initial(n: number): State {
  const stock = shuffled(
    Array.from({ length: 100 }, (_, i) => (i < 12 ? 4 : i % 4)),
  );
  const hands = Array.from({ length: n }, () => stock.splice(0, 4));
  return {
    hands,
    stock,
    discard: [],
    market: stock.splice(0, 5),
    owners: routes.map(() => -1),
    trains: Array(n).fill(24),
    scores: Array(n).fill(0),
    contracts: Array.from({ length: n }, () =>
      shuffled([
        { a: 0, b: 3, points: 9 },
        { a: 1, b: 7, points: 7 },
        { a: 2, b: 6, points: 10 },
        { a: 0, b: 7, points: 8 },
        { a: 3, b: 6, points: 8 },
        { a: 1, b: 3, points: 6 },
      ]).slice(0, 2),
    ),
    turn: 0,
    draws: 0,
    last: null,
    ply: 0,
    winner: null,
  };
}
export function connected(s: State, p: number, a: number, b: number) {
  const seen = new Set([a]),
    todo = [a];
  while (todo.length) {
    const v = todo.pop()!;
    routes.forEach((r, i) => {
      if (s.owners[i] !== p) return;
      const w = r.a === v ? r.b : r.b === v ? r.a : -1;
      if (w >= 0 && !seen.has(w)) {
        seen.add(w);
        todo.push(w);
      }
    });
  }
  return seen.has(b);
}
export function claimable(s: State, p: number, i: number) {
  const r = routes[i],
    h = s.hands[p];
  return (
    !!r &&
    s.owners[i] === -1 &&
    s.trains[p] >= r.n &&
    h.filter((v) => v === r.color || v === 4).length >= r.n
  );
}
function end(s: State) {
  s.turn = (s.turn + 1) % s.hands.length;
  s.draws = 0;
  s.ply++;
  if (s.last !== null) s.last--;
  if (s.last === null && s.trains.some((v) => v <= 2)) s.last = s.hands.length;
  if (s.last === 0 || s.ply >= 150 || s.owners.every((v) => v >= 0)) {
    s.scores = s.scores.map(
      (score, p) =>
        score +
        s.contracts[p].reduce(
          (v, c) => v + (connected(s, p, c.a, c.b) ? c.points : -c.points),
          0,
        ),
    );
    const max = Math.max(...s.scores);
    s.winner = s.scores.flatMap((v, p) => (v === max ? [p] : []));
  }
  return s;
}
function take(s: State) {
  if (!s.stock.length) {
    s.stock = shuffled(s.discard);
    s.discard = [];
  }
  return s.stock.pop();
}
export function draw(s: State, index = -1): State {
  if (
    s.winner !== null ||
    index >= s.market.length ||
    (index >= 0 && s.draws === 1 && s.market[index] === 4)
  )
    return s;
  const x = structuredClone(s),
    card = index < 0 ? take(x) : x.market[index];
  if (card === undefined) return end(x);
  if (index >= 0) {
    x.market.splice(index, 1);
    const next = take(x);
    if (next !== undefined) x.market.splice(index, 0, next);
  }
  x.hands[x.turn].push(card);
  x.draws += index >= 0 && card === 4 ? 2 : 1;
  return x.draws >= 2 ? end(x) : x;
}
export function claim(s: State, i: number): State {
  if (s.winner !== null || s.draws || !claimable(s, s.turn, i)) return s;
  const x = structuredClone(s),
    r = routes[i];
  for (let k = 0; k < r.n; k++) {
    let j = x.hands[x.turn].indexOf(r.color);
    if (j < 0) j = x.hands[x.turn].indexOf(4);
    x.discard.push(...x.hands[x.turn].splice(j, 1));
  }
  x.owners[i] = x.turn;
  x.trains[x.turn] -= r.n;
  x.scores[x.turn] += [0, 1, 2, 4, 7, 10, 15][r.n];
  return end(x);
}
export function automatic(s: State): State {
  if (!s.draws) {
    const options = routes
      .map((_, i) => i)
      .filter((i) => claimable(s, s.turn, i));
    if (options.length) {
      options.sort((a, b) => {
        const score = (i: number) => {
          const x = {
            ...s,
            owners: s.owners.map((v, j) => (j === i ? s.turn : v)),
          };
          return (
            routes[i].n +
            s.contracts[s.turn].reduce(
              (v, c) =>
                v +
                (!connected(s, s.turn, c.a, c.b) &&
                connected(x, s.turn, c.a, c.b)
                  ? c.points * 3
                  : 0),
              0,
            )
          );
        };
        return score(b) - score(a);
      });
      return claim(s, options[0]);
    }
  }
  const needs = routes
      .filter((_, i) => s.owners[i] === -1)
      .sort(
        (a, b) =>
          s.hands[s.turn].filter((c) => c === b.color).length -
          s.hands[s.turn].filter((c) => c === a.color).length,
      ),
    index = s.market.findIndex(
      (c) => (s.draws === 0 && c === 4) || c === needs[0]?.color,
    );
  return draw(s, index);
}
