import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  money: number[];
  production: number[];
  heat: number[];
  plants: number[];
  oxygen: number;
  temperature: number;
  oceans: number;
  surface: number[];
  round: number;
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Financia un proyecto planetario",
    money: Array(n).fill(12),
    production: Array(n).fill(2),
    heat: Array(n).fill(0),
    plants: Array(n).fill(0),
    oxygen: 0,
    temperature: 0,
    oceans: 0,
    surface: Array(16).fill(-1),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn,
    a = [
      { key: "income", label: "Generar: cobrar producción, calor y plantas" },
    ];
  if (s.money[p] >= 6)
    a.push({ key: "factory", label: "Fábrica: 6 créditos, +2 producción" });
  if (s.money[p] >= 4 && s.temperature < 8)
    a.push({ key: "heat", label: "Calentar: 4 créditos, temperatura +1" });
  if (s.heat[p] >= 4 && s.temperature < 8)
    a.push({ key: "convert", label: "Convertir 4 calor en temperatura" });
  if (s.money[p] >= 8 && s.oceans < 6)
    for (const [i, v] of s.surface.entries())
      if (v < 0)
        a.push({
          key: "ocean:" + i,
          label: "Océano en sector " + (i + 1) + " (8 créditos)",
        });
  if (s.plants[p] >= 4 && s.oxygen < 8)
    for (const [i, v] of s.surface.entries())
      if (v < 0)
        a.push({
          key: "green:" + i,
          label: "Vegetación en sector " + (i + 1) + " (4 plantas)",
        });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  const [a, raw] = key.split(":");
  if (a === "income") {
    t.money[p] += t.production[p] + 2;
    t.heat[p] += 2;
    t.plants[p] += 2;
  }
  if (a === "factory") {
    t.money[p] -= 6;
    t.production[p] += 2;
  }
  if (a === "heat" || a === "convert") {
    if (a === "heat") t.money[p] -= 4;
    else t.heat[p] -= 4;
    t.temperature++;
    t.scores[p] += 2;
  }
  if (a === "ocean") {
    t.money[p] -= 8;
    t.oceans++;
    t.surface[Number(raw)] = -2;
    t.scores[p] += 3;
  }
  if (a === "green") {
    t.plants[p] -= 4;
    t.oxygen++;
    t.surface[Number(raw)] = p;
    t.scores[p] += 2;
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (
    (t.oxygen === 8 && t.temperature === 8 && t.oceans === 6) ||
    t.round > 28
  ) {
    t.scores = t.scores.map(
      (v, i) =>
        v +
        t.surface.filter((p) => p === i).length +
        Math.floor(t.money[i] / 5),
    );
    t.winner = champion(t.scores);
  }
  t.message =
    "Generación " +
    t.round +
    " · O₂ " +
    t.oxygen +
    "/8 · calor " +
    t.temperature +
    "/8 · océanos " +
    t.oceans +
    "/6";
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    p = s.turn;
  const key =
    s.round < 7 && s.money[p] >= 6 && s.production[p] < 8
      ? "factory"
      : a.find((a) => a.key.startsWith("green:"))?.key ||
        a.find((a) => a.key === "convert")?.key ||
        a.find((a) => a.key.startsWith("ocean:"))?.key ||
        a.find((a) => a.key === "heat")?.key ||
        "income";
  return apply(s, key);
}
export function view(s: State) {
  return {
    cards: s.money.map((v, i) => ({
      key: String(i),
      label:
        "J" +
        (i + 1) +
        " · créditos " +
        v +
        " · producción " +
        s.production[i] +
        " · calor " +
        s.heat[i] +
        " · plantas " +
        s.plants[i],
      icon: "◉",
    })),
    notes: [
      "Objetivo común: O₂ 8, temperatura 8 y seis océanos. Cada proyecto concede PV al autor.",
      "Máximo 28 generaciones. El planeta tiene 16 sectores: coloca seis océanos y ocho bosques para completar parámetros.",
      "Es una edición original de gestión planetaria; no reproduce un reglamento comercial ni sus cartas.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.surface.map((v, i) => ({
      key: String(i),
      label:
        v === -2
          ? "Océano"
          : v >= 0
            ? "Bosque J" + (v + 1)
            : "Sector " + (i + 1),
      symbol: v === -2 ? "≈" : v >= 0 ? "♣" : "◇",
      owner: v >= 0 ? v : undefined,
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
