import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  coins: number[];
  properties: number[][];
  bids: number[];
  phase: "buy" | "sell";
  round: number;
  leader: number;
  offer: number[];
  history: string[];
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Puja en secreto por una propiedad",
    coins: Array(n).fill(15),
    properties: Array.from({ length: n }, () => []),
    bids: Array(n).fill(-1),
    phase: "buy",
    round: 1,
    leader: 0,
    offer: shuffle(Array.from({ length: 30 }, (_, i) => i + 1))
      .slice(0, n)
      .sort((a, b) => a - b),
    history: [],
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.phase === "buy"
    ? Array.from({ length: s.coins[s.turn] + 1 }, (_, i) => ({
        key: String(i),
        label: "Pujar " + i + " monedas",
      }))
    : s.properties[s.turn].map((v, i) => ({
        key: String(i),
        label: "Vender propiedad de valor " + v,
      }));
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  t.bids[p] =
    t.phase === "buy" ? Number(key) : t.properties[p].splice(Number(key), 1)[0];
  t.step++;
  if (t.bids.some((v) => v < 0)) {
    t.turn = (p + 1) % t.scores.length;
    return t;
  }
  const rank = Array.from({ length: t.scores.length }, (_, i) => i).sort(
    (a, b) =>
      t.bids[a] - t.bids[b] ||
      ((a - t.leader + t.scores.length) % t.scores.length) -
        ((b - t.leader + t.scores.length) % t.scores.length),
  );
  rank.forEach((p, i) => {
    if (t.phase === "buy") {
      t.coins[p] -= t.bids[p];
      t.properties[p].push(t.offer[i]);
    } else t.scores[p] += t.offer[i];
  });
  t.history.push(
    (t.phase === "buy" ? "Compra" : "Venta") +
      " " +
      t.round +
      ": " +
      t.bids.join("/") +
      " → lotes " +
      t.offer.join("/"),
  );
  if (t.phase === "sell" && t.round === 5) {
    t.scores = t.scores.map((v, i) => v + t.coins[i]);
    t.winner = champion(t.scores);
    return t;
  }
  if (t.round === 5) {
    t.phase = "sell";
    t.round = 1;
    t.message = "Escoge una propiedad para vender en secreto";
  } else t.round++;
  t.leader = (t.leader + 1) % t.scores.length;
  t.turn = t.leader;
  t.bids.fill(-1);
  t.offer = shuffle(
    Array.from({ length: t.phase === "buy" ? 30 : 16 }, (_, i) => i + 1),
  )
    .slice(0, t.scores.length)
    .sort((a, b) => a - b);
  return t;
}
export function automatic(s: State): State {
  if (s.phase === "buy")
    return apply(
      s,
      String(
        Math.min(
          s.coins[s.turn],
          Math.max(
            0,
            Math.round((Math.max(...s.offer) - Math.min(...s.offer)) / 7),
          ),
        ),
      ),
    );
  const own = s.properties[s.turn],
    high = Math.max(...s.offer) - Math.min(...s.offer) > 6,
    index = own.indexOf(high ? Math.max(...own) : Math.min(...own));
  return apply(s, String(index));
}
export function view(s: State) {
  return {
    private:
      "Tu saldo: " +
      s.coins[s.turn] +
      " · propiedades: " +
      s.properties[s.turn].join(", "),
    cards: s.offer.map((v, i) => ({
      key: String(i),
      label: (s.phase === "buy" ? "Propiedad " : "Cheque ") + v,
      icon: s.phase === "buy" ? "⌂" : "▤",
    })),
    notes: [
      (s.phase === "buy" ? "Compras" : "Ventas") + " · ronda " + s.round + "/5",
      ...s.bids.map(
        (v, i) =>
          "J" + (i + 1) + ": " + (v >= 0 ? "elección entregada" : "pendiente"),
      ),
      ...s.history.slice(-4),
      "De menor a mayor puja / propiedad se adjudican lotes de menor a mayor valor. En empate manda el orden cíclico desde el líder. Todos pagan su propia puja.",
      "Edición original de dos fases, sin pujas ascendentes ni reglas comerciales atribuidas.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.scores.length,
    cells: s.offer.map((v, i) => ({
      key: String(i),
      label: "Lote " + (i + 1),
      symbol: s.phase === "buy" ? "⌂" : "▤",
      detail: String(v),
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
