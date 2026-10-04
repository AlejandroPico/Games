import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  coins: number[];
  goods: number[][];
  bids: number[];
  lot: number;
  round: number;
  leader: number;
  history: string[];
}
const names = ["Seda", "Especias", "Cerámica", "Perfume"];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Elige una puja secreta",
    coins: Array(n).fill(12),
    goods: Array.from({ length: n }, () => Array(4).fill(0)),
    bids: Array(n).fill(-1),
    lot: Math.floor(Math.random() * 4),
    round: 1,
    leader: 0,
    history: [],
  };
}
export function actions(s: State) {
  return s.winner !== null
    ? []
    : Array.from({ length: s.coins[s.turn] + 1 }, (_, i) => ({
        key: String(i),
        label: "Pujar " + i + " monedas",
      }));
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  t.bids[p] = Number(key);
  t.step++;
  const next = (p + 1) % t.scores.length;
  if (t.bids.some((b) => b < 0)) {
    t.turn = next;
    return t;
  }
  const max = Math.max(...t.bids),
    winner = Array.from(
      { length: t.scores.length },
      (_, i) => (t.leader + i) % t.scores.length,
    ).find((i) => t.bids[i] === max)!;
  t.coins[winner] -= max;
  t.goods[winner][t.lot]++;
  t.scores[winner] += 2 + t.lot;
  t.history.push(
    "R" +
      t.round +
      ": " +
      t.bids.join("/") +
      " · " +
      names[t.lot] +
      " a J" +
      (winner + 1),
  );
  if (t.round === 12) {
    t.scores = t.scores.map(
      (v, i) => v + 5 * Math.min(...t.goods[i]) + Math.floor(t.coins[i] / 3),
    );
    t.winner = champion(t.scores);
  } else {
    t.round++;
    t.coins = t.coins.map((c) => c + 2);
    t.leader = (t.leader + 1) % t.scores.length;
    t.turn = t.leader;
    t.bids.fill(-1);
    t.lot = Math.floor(Math.random() * 4);
  }
  return t;
}
export function automatic(s: State): State {
  const p = s.turn,
    min = Math.min(...s.goods[p]),
    desired = 2 + s.lot + (s.goods[p][s.lot] === min ? 2 : 0),
    bid = Math.min(s.coins[p], desired + Math.floor(Math.random() * 3));
  return apply(s, String(bid));
}
export function view(s: State) {
  return {
    private:
      "Tu bolsa: " +
      s.coins[s.turn] +
      " monedas. Tu puja no se revela hasta cerrar la subasta.",
    cards: [
      {
        key: "lot",
        label: "Lote: " + names[s.lot] + " · " + (2 + s.lot) + " PV",
        icon: ["▥", "❋", "◒", "♧"][s.lot],
      },
    ],
    notes: [
      "Subasta " + s.round + "/12 · prioridad de empate J" + (s.leader + 1),
      ...s.goods.map(
        (g, i) =>
          "J" +
          (i + 1) +
          " mercancías " +
          g.join("/") +
          "; " +
          (s.bids[i] >= 0 ? "puja entregada" : "sin pujar"),
      ),
      ...s.history.slice(-4),
      "Cada conjunto de cuatro mercancías distintas vale 5 PV adicionales al final, más 1 PV por cada 3 monedas. Solo paga la puja ganadora.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: names.map((label, i) => ({
      key: String(i),
      label,
      symbol: ["▥", "❋", "◒", "♧"][i],
      detail: "Valor " + (2 + i),
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
