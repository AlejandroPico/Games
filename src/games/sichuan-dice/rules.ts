import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  tiles: number[][];
  round: number;
  target: number;
  phase: "roll" | "choose";
}
export const initial = (n = 2, target = 3): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  dice: [],
  message: "Variante original: elimina números con dos dados",
  step: 0,
  tiles: Array.from({ length: n }, () => [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  round: 0,
  target,
  phase: "roll",
});
export function combos(s: State) {
  const a = s.tiles[s.turn],
    sum = s.dice.reduce((a, b) => a + b, 0),
    out: number[][] = [];
  for (let mask = 1; mask < 1 << a.length; mask++) {
    const v = a.filter((_, i) => mask & (1 << i));
    if (v.reduce((a, b) => a + b, 0) === sum) out.push(v);
  }
  return out;
}
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : s.phase === "roll"
      ? [{ key: "roll", label: "Lanzar dos dados" }]
      : combos(s).map((v) => ({
          key: v.join(","),
          label: "Cerrar " + v.join(" + "),
        }));
function end(x: State) {
  x.scores[x.turn] += 45 - x.tiles[x.turn].reduce((a, b) => a + b, 0);
  x.turn++;
  x.phase = "roll";
  if (x.turn === x.scores.length) {
    x.turn = 0;
    x.round++;
    x.tiles = x.tiles.map(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (x.round >= x.target) x.winner = best(x.scores);
  }
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "roll") {
    x.dice = roll(2);
    x.phase = "choose";
    if (!combos(x).length) {
      x.message = "No puedes cerrar la suma: termina el turno";
      end(x);
    } else
      x.message =
        "Escoge números que sumen " + x.dice.reduce((a, b) => a + b, 0);
  } else {
    x.tiles[x.turn] = x.tiles[x.turn].filter(
      (v) => !key.split(",").map(Number).includes(v),
    );
    x.phase = "roll";
    x.message = "Números cerrados";
    if (!x.tiles[x.turn].length) end(x);
  }
  return x;
}
export const automatic = (s: State) => {
  const a = actions(s);
  return apply(
    s,
    a.sort((a, b) => b.key.split(",").length - a.key.split(",").length)[0]
      ?.key || "",
  );
};
