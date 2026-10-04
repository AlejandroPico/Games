import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  bank: number;
  target: number;
  phase: "roll" | "choose";
  remaining: number;
  final: number | null;
}
export const initial = (n = 2, target = 10000): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  dice: [],
  message: "Lanza seis dados",
  step: 0,
  bank: 0,
  target,
  phase: "roll",
  remaining: 6,
  final: null,
});
export function score(d: number[]): number {
  const c = Array(7).fill(0);
  d.forEach((v) => c[v]++);
  if (d.length === 6 && c.slice(1).every((v) => v === 1)) return 1500;
  if (d.length === 6 && c.filter((v) => v === 2).length === 3) return 1500;
  let p = 0;
  for (let v = 1; v <= 6; v++) {
    if (c[v] >= 3) {
      p += (v === 1 ? 1000 : v * 100) * 2 ** (c[v] - 3);
      c[v] = 0;
    }
    if (v === 1) p += c[v] * 100;
    else if (v === 5) p += c[v] * 50;
    else if (c[v]) return 0;
  }
  return p;
}
function end(s: State, bank: boolean) {
  if (bank) s.scores[s.turn] += s.bank;
  if (s.final === null && s.scores[s.turn] >= s.target)
    s.final = s.scores.length - 1;
  else if (s.final !== null) s.final--;
  if (s.final === 0) s.winner = best(s.scores);
  s.turn = (s.turn + 1) % s.scores.length;
  s.bank = 0;
  s.remaining = 6;
  s.phase = "roll";
}
export function actions(s: State): DiceAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "roll")
    return [
      { key: "roll", label: "Lanzar " + s.remaining + " dados" },
      ...(s.bank > 0 && (s.scores[s.turn] > 0 || s.bank >= 500)
        ? [{ key: "bank", label: "Conservar " + s.bank + " puntos" }]
        : []),
    ];
  const a: DiceAction[] = [];
  for (let mask = 1; mask < 1 << s.dice.length; mask++) {
    const d = s.dice.filter((_, i) => mask & (1 << i)),
      p = score(d);
    if (p)
      a.push({
        key: "keep-" + mask,
        label: "Apartar " + d.join(" · ") + " → " + p + " puntos",
      });
  }
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "bank") {
    x.message = "Puntos conservados";
    end(x, true);
  } else if (key === "roll") {
    x.dice = roll(x.remaining);
    x.phase = "choose";
    if (!actions(x).length) {
      x.message = "Farkle: pierdes " + x.bank + " puntos del turno";
      end(x, false);
    } else x.message = "Aparta al menos una combinación puntuable";
  } else {
    const mask = +key.slice(5),
      d = x.dice.filter((_, i) => mask & (1 << i));
    x.bank += score(d);
    x.remaining -= d.length;
    if (!x.remaining) x.remaining = 6;
    x.phase = "roll";
    x.message = "Acumulado " + x.bank + " · dados para relanzar " + x.remaining;
  }
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  if (s.phase === "choose") {
    a.sort(
      (a, b) =>
        score(s.dice.filter((_, i) => +b.key.slice(5) & (1 << i))) -
        score(s.dice.filter((_, i) => +a.key.slice(5) & (1 << i))),
    );
    return apply(s, a[0]?.key || "");
  }
  return apply(
    s,
    s.bank >= 600 && a.some((a) => a.key === "bank") ? "bank" : "roll",
  );
}
