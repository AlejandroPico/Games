import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Machine {
  input: number;
  output: number;
  count: number;
  cost: number;
}
export interface State extends DeductionPosition {
  resources: number[][];
  machines: Machine[][];
  market: Machine[];
  orders: { kind: number; amount: number; points: number }[];
  round: number;
}
const names = ["Mineral", "Metal", "Circuito", "Robot"],
  icons = ["◈", "▣", "▧", "♟"];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Construye, produce o entrega pedidos",
    resources: Array.from({ length: n }, () => [4, 0, 0, 0]),
    machines: Array.from({ length: n }, () => [
      { input: -1, output: 0, count: 3, cost: 0 },
    ]),
    market: [
      { input: 0, output: 1, count: 2, cost: 3 },
      { input: 1, output: 2, count: 2, cost: 4 },
      { input: 2, output: 3, count: 1, cost: 5 },
    ],
    orders: [
      { kind: 1, amount: 4, points: 5 },
      { kind: 2, amount: 3, points: 8 },
      { kind: 3, amount: 2, points: 12 },
    ],
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn,
    a = [{ key: "produce", label: "Activar cadena de máquinas" }];
  s.market.forEach((m, i) => {
    if (s.resources[p][0] >= m.cost && s.machines[p].length < 8)
      a.push({
        key: "build:" + i,
        label:
          "Máquina de " + names[m.output] + " (coste " + m.cost + " mineral)",
      });
  });
  s.orders.forEach((o, i) => {
    if (s.resources[p][o.kind] >= o.amount)
      a.push({
        key: "order:" + i,
        label:
          "Entregar " +
          o.amount +
          " " +
          names[o.kind] +
          " por " +
          o.points +
          " PV",
      });
  });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [a, raw] = key.split(":"),
    i = Number(raw);
  if (a === "produce") {
    for (const m of [...t.machines[p]].sort((a, b) => a.output - b.output)) {
      if (m.input < 0) t.resources[p][m.output] += m.count;
      else if (t.resources[p][m.input] >= 2) {
        t.resources[p][m.input] -= 2;
        t.resources[p][m.output] += m.count;
      }
    }
  } else if (a === "build") {
    t.resources[p][0] -= t.market[i].cost;
    t.machines[p].push(copy(t.market[i]));
  } else {
    const o = t.orders[i];
    t.resources[p][o.kind] -= o.amount;
    t.scores[p] += o.points;
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (t.round > 18) {
    t.scores = t.scores.map(
      (v, i) => v + t.machines[i].length + t.resources[i][3] * 2,
    );
    t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    orders = a.filter((a) => a.key.startsWith("order:"));
  if (orders.length) return apply(s, orders.at(-1)!.key);
  const builds = a.filter((a) => a.key.startsWith("build:"));
  for (const a of builds) {
    const m = s.market[Number(a.key.split(":")[1])];
    if (!s.machines[s.turn].some((x) => x.output === m.output))
      return apply(s, a.key);
  }
  return apply(s, "produce");
}
export function view(s: State) {
  return {
    cards: s.market.map((m, i) => ({
      key: String(i),
      label:
        names[m.input] +
        " ×2 → " +
        names[m.output] +
        " ×" +
        m.count +
        " · coste " +
        m.cost,
      icon: icons[m.output],
      action: actions(s).some((a) => a.key === "build:" + i)
        ? "build:" + i
        : undefined,
    })),
    notes: [
      "Ronda " +
        s.round +
        "/18. Recursos J" +
        (s.turn + 1) +
        ": " +
        s.resources[s.turn].map((v, i) => v + " " + names[i]).join(" · "),
      "Al producir se ordena toda la cadena de mineral a robot. Cada máquina se activa una vez; si falta entrada, se omite.",
      "Pedidos repetibles. Final: puntos de entregas + máquinas + dos por robot almacenado.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.machines[s.turn].map((m, i) => ({
      key: String(i),
      label: names[m.output],
      symbol: icons[m.output],
      detail:
        m.input < 0
          ? "Produce 3 mineral"
          : "2 " + names[m.input] + " → " + m.count,
      owner: s.turn,
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
