import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  bank: number;
  shots: number;
  bag: number[];
  feet: number[];
  brains: number[];
  lastColors: number[];
  final: number | null;
  target: number;
}
const supply = () => [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
export const initial = (n = 2, target = 13): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  dice: [],
  message: "Tres dados: cerebros, huellas y disparos",
  step: 0,
  bank: 0,
  shots: 0,
  bag: supply(),
  feet: [],
  brains: [],
  lastColors: [],
  final: null,
  target,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : [
        { key: "roll", label: "Lanzar tres dados" },
        ...(s.bank > 0
          ? [{ key: "bank", label: "Conservar " + s.bank + " cerebros" }]
          : []),
      ];
function end(s: State, bank: boolean) {
  if (bank) s.scores[s.turn] += s.bank;
  if (s.final === null && s.scores[s.turn] >= s.target)
    s.final = s.scores.length - 1;
  else if (s.final !== null) s.final--;
  if (s.final === 0) s.winner = best(s.scores);
  s.turn = (s.turn + 1) % s.scores.length;
  s.bank = 0;
  s.shots = 0;
  s.bag = supply();
  s.feet = [];
  s.brains = [];
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "bank") {
    x.message = "Cerebros conservados";
    end(x, true);
    return x;
  }
  const colors = [...x.feet];
  x.feet = [];
  while (colors.length < 3) {
    if (!x.bag.length) {
      x.bag = x.brains.splice(0);
      if (!x.bag.length) break;
    }
    colors.push(x.bag.splice(Math.floor(Math.random() * x.bag.length), 1)[0]);
  }
  x.lastColors = colors;
  x.dice = colors.map((c) => {
    const v = die();
    return v <= 3 - c ? 1 : v <= 5 - c ? 2 : 3;
  });
  x.dice.forEach((v, i) => {
    if (v === 1) {
      x.bank++;
      x.brains.push(colors[i]);
    } else if (v === 2) x.feet.push(colors[i]);
    else x.shots++;
  });
  x.message =
    x.bank +
    " cerebros · " +
    x.shots +
    " disparos · 1=cerebro, 2=huellas, 3=disparo";
  if (x.shots >= 3) {
    x.message = "Tres disparos: turno perdido";
    end(x, false);
  }
  return x;
}
export const automatic = (s: State) =>
  apply(s, s.bank >= 3 || (s.bank > 0 && s.shots >= 2) ? "bank" : "roll");
