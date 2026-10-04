import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  risk: number[];
  alive: boolean[];
  deck: number[];
  round: number;
}
const names = [
  "Calma",
  "Desvío",
  "Doble riesgo",
  "Blindaje",
  "Provocación",
  "Salvavidas",
];
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 60 }, (_, i) => i % 6));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(10),
    step: 0,
    message: "Reduce tu riesgo o pásalo a un rival",
    hands: Array.from({ length: n }, () => deck.splice(0, 5)),
    risk: Array(n).fill(0),
    alive: Array(n).fill(true),
    deck,
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const a = [{ key: "draw", label: "Robar dos cartas y aceptar un riesgo" }];
  s.hands[s.turn].forEach((c, i) => {
    if ([1, 2, 4].includes(c))
      s.alive.forEach((live, p) => {
        if (live && p !== s.turn)
          a.push({
            key: "play:" + i + "," + p,
            label: names[c] + " a J" + (p + 1),
          });
      });
    else a.push({ key: "play:" + i + "," + s.turn, label: names[c] });
  });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  if (!t.deck.length)
    t.deck = shuffle(Array.from({ length: 36 }, (_, i) => i % 6));
  if (key === "draw") {
    t.risk[p]++;
    for (let k = 0; k < 2; k++)
      if (t.hands[p].length < 9) {
        if (!t.deck.length)
          t.deck = shuffle(Array.from({ length: 36 }, (_, i) => i % 6));
        t.hands[p].push(t.deck.pop()!);
      }
  } else {
    const [i, target] = key.split(":")[1].split(",").map(Number),
      c = t.hands[p].splice(i, 1)[0];
    if (c === 0) t.risk[p] = Math.max(0, t.risk[p] - 2);
    if (c === 1) {
      const v = Math.min(2, t.risk[p]);
      t.risk[p] -= v;
      t.risk[target] += v;
    }
    if (c === 2) {
      t.risk[target] += 3;
      t.risk[p]++;
    }
    if (c === 3) t.risk[p] = Math.max(0, t.risk[p] - 3);
    if (c === 4) t.risk[target] += 2;
    if (c === 5) t.risk[p] = 0;
    if (t.hands[p].length < 9) t.hands[p].push(t.deck.pop()!);
  }
  t.step++;
  t.risk[p]++;
  for (let i = 0; i < t.alive.length; i++)
    if (t.risk[i] >= 10) t.alive[i] = false;
  t.scores = t.risk.map((v, i) => (t.alive[i] ? 10 - v : 0));
  const live = t.alive.flatMap((v, i) => (v ? [i] : []));
  if (live.length <= 1) {
    t.winner = live[0] ?? -1;
    return t;
  }
  for (let k = 1; k <= t.alive.length; k++) {
    const next = (p + k) % t.alive.length;
    if (t.alive[next]) {
      if (next <= p) t.round++;
      t.turn = next;
      break;
    }
  }
  if (t.round > 20) t.winner = champion(t.scores);
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    p = s.turn;
  if (s.risk[p] >= 5) {
    const safe = a.find(
      (a) =>
        a.key.startsWith("play:") &&
        [5, 3, 0].includes(
          s.hands[p][Number(a.key.split(":")[1].split(",")[0])],
        ),
    );
    if (safe) return apply(s, safe.key);
  }
  const plays = a.filter((a) => a.key.startsWith("play:"));
  return apply(s, plays.length ? pick(plays).key : "draw");
}
export function view(s: State) {
  return {
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c],
      icon: ["≈", "↪", "⚠", "◇", "⚡", "♥"][c],
    })),
    notes: [
      "Riesgos: " + s.risk.join("/") + " · ronda " + s.round + "/20",
      "Tras tu acción sumas un riesgo por desgaste. Llegar a diez elimina inmediatamente. Doble riesgo +3 al rival y +1 propio; Provocación +2 rival; Desvío transfiere hasta dos propios.",
      "Gana el último superviviente; en veinte rondas, el menor riesgo entre quienes sigan vivos. Edición original, temática de riesgo ficticio.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.alive.length,
    cells: s.alive.map((live, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: live ? "♟" : "×",
      detail: live ? s.risk[i] + "/10 riesgo" : "Eliminado",
    })),
  };
}

export const engine: StrategyEngine<State> = {
  initial,
  actions,
  apply,
  automatic,
  view,
  scene,
};
