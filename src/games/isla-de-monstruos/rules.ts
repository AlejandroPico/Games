import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  health: number[];
  energy: number[];
  island: number;
  dice: number[];
  phase: "roll" | "resolve";
  rounds: number;
}
const faces = ["★", "⚡", "♥", "⚔", "★", "⚡"];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Tira los dados de tu monstruo",
    health: Array(n).fill(10),
    energy: Array(n).fill(0),
    island: -1,
    dice: [],
    phase: "roll",
    rounds: 0,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "roll") return [{ key: "roll", label: "Tirar tres dados" }];
  return [
    { key: "resolve", label: "Resolver dados" },
    ...(s.energy[s.turn] >= 2
      ? [{ key: "reroll", label: "Gastar 2 energía y repetir todos" }]
      : []),
    ...(s.energy[s.turn] >= 4
      ? [{ key: "blast", label: "Gastar 4 energía: ataque adicional" }]
      : []),
  ];
}
function settle(t: State, blast: boolean) {
  const p = t.turn;
  for (const d of t.dice) {
    if (d === 0 || d === 4) t.scores[p]++;
    if (d === 1 || d === 5) t.energy[p]++;
    if (d === 2 && t.island !== p) t.health[p] = Math.min(10, t.health[p] + 1);
    if (d === 3)
      for (let j = 0; j < t.health.length; j++)
        if (j !== p && t.health[j] > 0 && (t.island === p || t.island === j))
          t.health[j]--;
  }
  if (blast)
    for (let j = 0; j < t.health.length; j++)
      if (j !== p && t.health[j] > 0) t.health[j] -= 2;
  const gone = t.island >= 0 && t.health[t.island] <= 0;
  if (gone || t.island < 0) t.island = p;
  if (t.island === p) t.scores[p] += 2;
  const live = t.health.flatMap((h, i) => (h > 0 ? [i] : []));
  if (live.length === 1) {
    t.winner = live[0];
    return;
  }
  if (t.scores[p] >= 20) {
    t.winner = p;
    return;
  }
  for (let k = 1; k <= t.health.length; k++)
    if (t.health[(p + k) % t.health.length] > 0) {
      t.turn = (p + k) % t.health.length;
      break;
    }
  t.rounds++;
  if (t.rounds >= 150)
    t.winner = champion(t.scores.map((v, i) => (t.health[i] > 0 ? v : -999)));
  t.phase = "roll";
  t.dice = [];
  t.message = "Tira los dados de tu monstruo";
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s);
  t.step++;
  if (key === "roll" || key === "reroll") {
    if (key === "reroll") t.energy[t.turn] -= 2;
    t.dice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6));
    t.phase = "resolve";
    t.message = "Resuelve o compra una repetición";
  } else {
    if (key === "blast") t.energy[t.turn] -= 4;
    settle(t, key === "blast");
  }
  return t;
}
export function automatic(s: State): State {
  return apply(
    s,
    s.phase === "roll"
      ? "roll"
      : s.energy[s.turn] >= 4 &&
          s.health.some((h, i) => i !== s.turn && h > 0 && h <= 2)
        ? "blast"
        : "resolve",
  );
}
export function view(s: State) {
  return {
    cards: s.dice.map((d, i) => ({
      key: String(i),
      label: faces[d],
      icon: faces[d],
    })),
    notes: s.health
      .map(
        (h, i) =>
          "J" +
          (i + 1) +
          " · vida " +
          Math.max(0, h) +
          " · energía " +
          s.energy[i] +
          (s.island === i ? " · isla" : ""),
      )
      .concat(
        "La isla concede 2 PV por resolución pero impide curarse. Ataques desde la isla golpean a todos; desde fuera, a su ocupante.",
        "20 PV o último superviviente gana. Edición original: tres dados y repetición pagada sin límite mientras queden energías.",
      ),
  };
}
export function scene(s: State) {
  return {
    columns: 3,
    cells: [
      { key: "sea", label: "Océano", symbol: "≈" },
      {
        key: "island",
        label: s.island < 0 ? "Isla libre" : "Isla · J" + (s.island + 1),
        symbol: "▲",
        owner: s.island >= 0 ? s.island : undefined,
      },
      { key: "shore", label: "Costa", symbol: "≋" },
    ],
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
