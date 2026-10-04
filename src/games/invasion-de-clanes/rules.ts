import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  lands: { owner: number; troops: number; value: number }[];
  reserve: number[];
  phase: "reinforce" | "attack";
  round: number;
}
function neighbors(i: number): number[] {
  return [
    i % 4 ? i - 1 : -1,
    i % 4 < 3 ? i + 1 : -1,
    i >= 4 ? i - 4 : -1,
    i < 8 ? i + 4 : -1,
  ].filter((i) => i >= 0);
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Refuerza un territorio propio",
    lands: Array.from({ length: 12 }, (_, i) => ({
      owner: i % n,
      troops: 2,
      value: 1 + (i % 3),
    })),
    reserve: Array(n).fill(3),
    phase: "reinforce",
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "reinforce")
    return s.lands.flatMap((l, i) =>
      l.owner === s.turn
        ? [
            {
              key: "reinforce:" + i,
              label:
                "Reforzar territorio " + (i + 1) + " con " + s.reserve[s.turn],
            },
          ]
        : [],
    );
  const a = [{ key: "pass", label: "Cerrar campaña" }];
  s.lands.forEach((l, i) => {
    if (l.owner === s.turn && l.troops > 1)
      for (const j of neighbors(i))
        if (s.lands[j].owner !== s.turn)
          a.push({
            key: "attack:" + i + "," + j,
            label: "Atacar " + (j + 1) + " desde " + (i + 1),
          });
  });
  return a;
}
function endTurn(t: State) {
  for (let p = 0; p < t.scores.length; p++)
    t.scores[p] = t.lands
      .filter((l) => l.owner === p)
      .reduce((v, l) => v + l.value, 0);
  const live = t.scores.flatMap((v, i) => (v > 0 ? [i] : []));
  if (live.length === 1) {
    t.winner = live[0];
    return;
  }
  let next = t.turn;
  for (let k = 1; k <= t.scores.length; k++) {
    const p = (t.turn + k) % t.scores.length;
    if (t.scores[p]) {
      next = p;
      break;
    }
  }
  if (next <= t.turn) t.round++;
  t.turn = next;
  t.reserve[next] = Math.max(
    3,
    Math.floor(t.lands.filter((l) => l.owner === next).length / 2),
  );
  t.phase = "reinforce";
  t.message = "Refuerza un territorio propio";
  if (t.round > 12) t.winner = champion(t.scores);
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s);
  t.step++;
  if (key === "pass") {
    endTurn(t);
    return t;
  }
  const [a, raw] = key.split(":");
  if (a === "reinforce") {
    t.lands[Number(raw)].troops += t.reserve[t.turn];
    t.reserve[t.turn] = 0;
    t.phase = "attack";
    t.message = "Ataca territorios vecinos o cierra campaña";
  } else {
    const [from, to] = raw.split(",").map(Number),
      x = t.lands[from],
      y = t.lands[to],
      att = 1 + Math.floor(Math.random() * 6) + Math.min(3, x.troops - 1),
      def = 1 + Math.floor(Math.random() * 6) + Math.min(3, y.troops);
    if (att > def) {
      y.troops--;
      if (y.troops <= 0) {
        y.owner = t.turn;
        y.troops = x.troops - 1;
        x.troops = 1;
      }
    } else x.troops--;
    t.message =
      "Ataque " +
      att +
      " / defensa " +
      def +
      (att > def ? " · rival pierde una tropa" : " · pierdes una tropa");
    if (t.step >= 700) {
      t.scores = t.scores.map((_, p) =>
        t.lands.filter((l) => l.owner === p).reduce((v, l) => v + l.value, 0),
      );
      t.winner = champion(t.scores);
    }
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (s.phase === "reinforce") {
    const choices = a.map((a) => {
      const i = Number(a.key.split(":")[1]),
        weak = Math.min(
          ...neighbors(i)
            .filter((j) => s.lands[j].owner !== s.turn)
            .map((j) => s.lands[j].troops),
        );
      return {
        key: a.key,
        value: Number.isFinite(weak)
          ? s.lands[i].troops + s.reserve[s.turn] - weak
          : -100,
      };
    });
    return apply(s, choices.sort((a, b) => b.value - a.value)[0].key);
  }
  const attacks = a
    .filter((a) => a.key.startsWith("attack:"))
    .map((a) => {
      const [i, j] = a.key.split(":")[1].split(",").map(Number);
      return { key: a.key, value: s.lands[i].troops - s.lands[j].troops };
    })
    .sort((a, b) => b.value - a.value);
  return apply(s, attacks[0]?.value >= 1 ? attacks[0].key : "pass");
}
export function view(s: State) {
  return {
    cards: [],
    notes: [
      "Campaña " +
        s.round +
        "/12. Refuerzos: máximo entre 3 y la mitad de tus territorios (redondeo inferior).",
      "Ataque: dado + hasta tres tropas móviles; defensa: dado + hasta tres defensores. Los empates favorecen al defensor.",
      "Puedes atacar varias veces hasta cerrar campaña. Conquistar traslada todas las tropas menos una del origen. Gana el control exclusivo o la mayor suma de valores al cerrar 12 campañas.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.lands.map((l, i) => ({
      key: String(i),
      label: "Territorio " + (i + 1) + " · J" + (l.owner + 1),
      symbol: "⚑",
      owner: l.owner,
      detail: l.troops + " tropas · " + l.value + " PV",
      action:
        s.phase === "reinforce" && l.owner === s.turn
          ? "reinforce:" + i
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
