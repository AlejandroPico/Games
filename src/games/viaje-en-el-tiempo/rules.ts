import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  energy: number[];
  era: number[];
  relics: number[][];
  paradox: number[];
  gates: { era: number; cost: number; value: number; open: boolean }[];
  round: number;
}
const eras = ["Antigüedad", "Renacimiento", "Era industrial", "Futuro"];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Viaja, recupera energía o rescata una reliquia",
    energy: Array(n).fill(5),
    era: Array(n).fill(0),
    relics: Array.from({ length: n }, () => Array(4).fill(0)),
    paradox: Array(n).fill(0),
    gates: Array.from({ length: 16 }, (_, i) => ({
      era: i % 4,
      cost: 1 + (i % 3),
      value: 2 + (i % 5),
      open: true,
    })),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn,
    a = [
      { key: "charge", label: "Recargar tres energías" },
      { key: "stabilize", label: "Reducir dos paradojas" },
    ];
  for (let e = 0; e < 4; e++)
    if (e !== s.era[p] && s.energy[p] >= Math.abs(e - s.era[p]) + 1)
      a.push({
        key: "travel:" + e,
        label:
          "Viajar a " +
          eras[e] +
          " (" +
          (Math.abs(e - s.era[p]) + 1) +
          " energía)",
      });
  s.gates.forEach((g, i) => {
    if (g.open && g.era === s.era[p] && s.energy[p] >= g.cost)
      a.push({
        key: "rescue:" + i,
        label:
          "Rescatar reliquia " +
          (i + 1) +
          " · " +
          g.value +
          " PV por " +
          g.cost +
          " energía",
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
  if (a === "charge") t.energy[p] += 3;
  if (a === "stabilize") t.paradox[p] = Math.max(0, t.paradox[p] - 2);
  if (a === "travel") {
    t.energy[p] -= Math.abs(i - t.era[p]) + 1;
    if (i < t.era[p]) t.paradox[p]++;
    t.era[p] = i;
  }
  if (a === "rescue") {
    const g = t.gates[i];
    g.open = false;
    t.energy[p] -= g.cost;
    t.relics[p][g.era]++;
    t.scores[p] += g.value;
    t.paradox[p]++;
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (t.round > 18 || t.gates.every((g) => !g.open)) {
    t.scores = t.scores.map(
      (v, i) => v + 8 * Math.min(...t.relics[i]) - t.paradox[i] * 2,
    );
    t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    rescue = a.filter((a) => a.key.startsWith("rescue:"));
  if (rescue.length)
    return apply(
      s,
      rescue.sort(
        (a, b) =>
          s.gates[Number(b.key.split(":")[1])].value -
          s.gates[Number(a.key.split(":")[1])].value,
      )[0].key,
    );
  if (s.round > 14 && s.paradox[s.turn] > 1) return apply(s, "stabilize");
  const travel = a
    .filter((a) => a.key.startsWith("travel:"))
    .filter((a) =>
      s.gates.some((g) => g.open && g.era === Number(a.key.split(":")[1])),
    );
  return apply(s, travel.length ? travel[0].key : "charge");
}
export function view(s: State) {
  return {
    cards: s.energy.map((v, i) => ({
      key: String(i),
      label:
        "J" +
        (i + 1) +
        " · " +
        eras[s.era[i]] +
        " · energía " +
        v +
        " · paradojas " +
        s.paradox[i],
      icon: "◷",
    })),
    notes: [
      "Ronda " +
        s.round +
        "/18. Viajar cuesta distancia temporal + 1. Viajar hacia atrás añade una paradoja; rescatar también.",
      "Estabilizar elimina dos paradojas. Al final restan 2 PV cada una. Un conjunto de reliquias de las cuatro épocas vale 8 PV extra.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.gates.map((g, i) => ({
      key: String(i),
      label: eras[g.era],
      symbol: g.open ? "◷" : "×",
      detail: g.open ? g.value + " PV · coste " + g.cost : "Rescatada",
      action: actions(s).some((a) => a.key === "rescue:" + i)
        ? "rescue:" + i
        : undefined,
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
