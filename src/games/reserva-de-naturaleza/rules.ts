import { shuffled } from "../../shared/cards";
export const animalTypes = [
  { name: "Zorro", size: 1, terrain: 0, cost: 4, power: 1, appeal: 3 },
  { name: "Lince", size: 2, terrain: 0, cost: 6, power: 2, appeal: 5 },
  { name: "Ciervo", size: 2, terrain: 1, cost: 5, power: 2, appeal: 4 },
  { name: "Elefante", size: 3, terrain: 1, cost: 8, power: 4, appeal: 7 },
  { name: "Nutria", size: 1, terrain: 2, cost: 4, power: 1, appeal: 3 },
  { name: "Flamenco", size: 2, terrain: 2, cost: 5, power: 2, appeal: 4 },
  { name: "Oso", size: 3, terrain: 0, cost: 7, power: 3, appeal: 6 },
  { name: "Jirafa", size: 3, terrain: 1, cost: 7, power: 3, appeal: 6 },
  { name: "Pingüino", size: 2, terrain: 2, cost: 6, power: 3, appeal: 5 },
];
export const actions = [
  "Fondos",
  "Investigación",
  "Hábitat",
  "Animales",
  "Conservación",
];
export const terrains = ["Bosque", "Pradera", "Agua"];
export type Zoo = {
  coins: number;
  research: number;
  appeal: number;
  conservation: number;
  row: number[];
  land: { terrain: number; animal: number }[];
  animals: number[];
};
export type State = {
  zoos: Zoo[];
  market: number[];
  stock: number[];
  turn: number;
  ply: number;
  remaining: number | null;
  winner: number[] | null;
};
export const initial = (n: number): State => ({
  zoos: Array.from({ length: n }, () => ({
    coins: 12,
    research: 0,
    appeal: 0,
    conservation: 0,
    row: [0, 1, 2, 3, 4],
    land: Array.from({ length: 16 }, () => ({ terrain: -1, animal: -1 })),
    animals: [],
  })),
  market: [0, 1, 2, 4],
  stock: shuffled(Array.from({ length: 90 }, (_, i) => i % 9)),
  turn: 0,
  ply: 0,
  remaining: null,
  winner: null,
});
export const scores = (s: State) =>
  s.zoos.map((z) => z.appeal + z.conservation * 3 + Math.floor(z.coins / 5));
export const power = (z: Zoo, action: number) => z.row.indexOf(action) + 1;
export function spaces(z: Zoo, from: number, terrain: number) {
  const seen = new Set<number>(),
    todo = [from];
  while (todo.length) {
    const i = todo.pop()!;
    if (
      i < 0 ||
      i >= 16 ||
      seen.has(i) ||
      z.land[i].terrain !== terrain ||
      z.land[i].animal !== -1
    )
      continue;
    seen.add(i);
    for (const j of [i - 4, i + 4, i % 4 ? i - 1 : -1, i % 4 < 3 ? i + 1 : -1])
      if (j >= 0) todo.push(j);
  }
  return [...seen];
}
export function act(s: State, action: number, index = 0, terrain = 0): State {
  if (s.winner || action < 0 || action > 4) return s;
  const x = structuredClone(s),
    z = x.zoos[x.turn],
    p = power(z, action);
  if (action === 0) z.coins += p * 3;
  if (action === 1) z.research += Math.ceil(p / 2);
  if (action === 2) {
    const size = Math.min(p, 4),
      cells = Array.from({ length: size }, (_, k) => index + k);
    if (
      terrain < 0 ||
      terrain > 2 ||
      cells.some(
        (i) =>
          i >= 16 ||
          Math.floor(i / 4) !== Math.floor(index / 4) ||
          z.land[i].terrain !== -1,
      ) ||
      z.coins < size
    )
      return s;
    cells.forEach((i) => (z.land[i] = { terrain, animal: -1 }));
    z.coins -= size;
  }
  if (action === 3) {
    const type = x.market[index],
      a = animalTypes[type];
    if (!a || p < a.power || z.coins < a.cost) return s;
    const vacant = z.land
      .map((_, i) => i)
      .map((i) => spaces(z, i, a.terrain))
      .find((list) => list.length >= a.size);
    if (!vacant) return s;
    vacant.slice(0, a.size).forEach((i) => (z.land[i].animal = type));
    z.coins -= a.cost;
    z.appeal += a.appeal;
    z.animals.push(type);
    x.market[index] = x.stock.pop() ?? Math.floor(Math.random() * 9);
  }
  if (action === 4) {
    if (p < 3 || z.research < 2 || z.animals.length < 2 || z.coins < 3)
      return s;
    z.research -= 2;
    z.coins -= 3;
    z.conservation += p >= 5 ? 2 : 1;
  }
  z.row = [action, ...z.row.filter((v) => v !== action)];
  x.turn = (x.turn + 1) % x.zoos.length;
  x.ply++;
  if (x.remaining !== null) x.remaining--;
  if (x.remaining === null && z.appeal + z.conservation * 3 >= 35)
    x.remaining = x.zoos.length;
  if (x.remaining === 0 || x.ply >= x.zoos.length * 30) {
    const v = scores(x),
      max = Math.max(...v);
    x.winner = v.flatMap((score, p) => (score === max ? [p] : []));
  }
  return x;
}
export function automatic(s: State): State {
  const z = s.zoos[s.turn],
    options: {
      action: number;
      index: number;
      terrain: number;
      weight: number;
    }[] = [];
  for (let a = 0; a < 5; a++)
    for (let i = 0; i < (a === 2 ? 16 : a === 3 ? s.market.length : 1); i++)
      for (let t = 0; t < (a === 2 ? 3 : 1); t++) {
        const x = act(s, a, i, t);
        if (x === s) continue;
        const p = power(z, a),
          weight =
            a === 3
              ? animalTypes[s.market[i]].appeal * 3
              : a === 4
                ? 15
                : a === 2
                  ? (z.land.some((c) => c.terrain === t && c.animal === -1)
                      ? 1
                      : 8) + p
                  : a === 0
                    ? z.coins < 6
                      ? 14
                      : p * 1.3
                    : z.research < 2
                      ? 8
                      : 1;
        options.push({ action: a, index: i, terrain: t, weight });
      }
  options.sort((a, b) => b.weight - a.weight);
  const best = options[0];
  return act(s, best.action, best.index, best.terrain);
}
