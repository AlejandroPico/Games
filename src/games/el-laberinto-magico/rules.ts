import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  walls: number[];
  positions: number[];
  goals: number[];
  insertion: number;
  phase: "shift" | "move";
  last: number;
}
function neighbors(s: State, i: number) {
  const n = 5,
    a: number[] = [];
  for (const [d, delta, opp] of [
    [1, -n, 4],
    [2, 1, 8],
    [4, n, 1],
    [8, -1, 2],
  ]) {
    const j = i + delta;
    if (
      j >= 0 &&
      j < 25 &&
      Math.abs((j % n) - (i % n)) +
        Math.abs(Math.floor(j / n) - Math.floor(i / n)) ===
        1 &&
      s.walls[i] & d &&
      s.walls[j] & opp
    )
      a.push(j);
  }
  return a;
}
export function reachable(s: State): number[] {
  const q = [s.positions[s.turn]],
    seen = new Set(q);
  for (let i = 0; i < q.length; i++)
    for (const j of neighbors(s, q[i]))
      if (!seen.has(j)) {
        seen.add(j);
        q.push(j);
      }
  return q;
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Desplaza una fila o columna",
    walls: Array.from({ length: 25 }, () =>
      pick([3, 6, 9, 12, 5, 10, 7, 11, 13, 14]),
    ),
    positions: [0, 24, 4, 20].slice(0, n),
    goals: Array.from({ length: n }, () => Math.floor(Math.random() * 25)),
    insertion: pick([3, 6, 9, 12]),
    phase: "shift",
    last: -1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.phase === "shift"
    ? Array.from({ length: 20 }, (_, i) => i)
        .filter((i) => i !== (s.last ^ 1))
        .map((i) => ({
          key: "shift:" + i,
          label:
            (i < 10 ? "Fila " : "Columna ") +
            (Math.floor((i % 10) / 2) + 1) +
            (i % 2 ? " ← / ↑" : " → / ↓"),
        }))
    : reachable(s).map((i) => ({
        key: "move:" + i,
        label: "Mover a F" + (Math.floor(i / 5) + 1) + "C" + ((i % 5) + 1),
      }));
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    [kind, raw] = key.split(":"),
    i = Number(raw);
  t.step++;
  if (kind === "shift") {
    const line = Math.floor((i % 10) / 2),
      row = i < 10,
      reverse = i % 2 === 1,
      indices = Array.from({ length: 5 }, (_, k) =>
        row ? line * 5 + k : k * 5 + line,
      );
    if (reverse) indices.reverse();
    const eject = t.walls[indices[4]];
    for (let k = 4; k > 0; k--) t.walls[indices[k]] = t.walls[indices[k - 1]];
    t.walls[indices[0]] = t.insertion;
    t.insertion = eject;
    t.positions = t.positions.map((p) =>
      indices.includes(p) ? indices[(indices.indexOf(p) + 1) % 5] : p,
    );
    t.last = i;
    t.phase = "move";
    t.message = "Camina por conexiones abiertas hasta tu tesoro";
  } else {
    t.positions[t.turn] = i;
    if (i === t.goals[t.turn]) {
      t.scores[t.turn]++;
      t.goals[t.turn] = Math.floor(Math.random() * 25);
    }
    if (t.scores[t.turn] >= 5) t.winner = t.turn;
    else if (t.step >= 400) t.winner = champion(t.scores);
    t.turn = (t.turn + 1) % t.scores.length;
    t.phase = "shift";
    t.message = "Desplaza una fila o columna";
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (s.phase === "move") {
    const goal = s.goals[s.turn],
      r = reachable(s),
      i = r.includes(goal)
        ? goal
        : r.sort(
            (a, b) =>
              Math.abs((a % 5) - (goal % 5)) +
              Math.abs(Math.floor(a / 5) - Math.floor(goal / 5)) -
              Math.abs((b % 5) - (goal % 5)) -
              Math.abs(Math.floor(b / 5) - Math.floor(goal / 5)),
          )[0];
    return apply(s, "move:" + i);
  }
  const valued = a.map((a) => {
    const t = apply(s, a.key),
      r = reachable(t);
    return { key: a.key, value: r.includes(t.goals[t.turn]) ? 100 : r.length };
  });
  return apply(s, valued.sort((a, b) => b.value - a.value)[0].key);
}
export function view(s: State) {
  return {
    cards: [
      {
        key: "extra",
        label: "Loseta entrante",
        icon: [
          "",
          "╵",
          "╶",
          "└",
          "╷",
          "│",
          "┌",
          "├",
          "╴",
          "┘",
          "─",
          "┴",
          "┐",
          "┤",
          "┬",
          "┼",
        ][s.insertion],
      },
    ],
    notes: [
      "J" +
        (s.turn + 1) +
        " tesoro en F" +
        (Math.floor(s.goals[s.turn] / 5) + 1) +
        "C" +
        ((s.goals[s.turn] % 5) + 1),
      "Primero desplaza una línea, luego camina a cualquier casilla conectada. Los peones expulsados reaparecen en el extremo entrante. No deshagas el último desplazamiento.",
      "Gana quien encuentre cinco tesoros; tras 400 acciones gana la mayor colección.",
    ],
  };
}
export function scene(s: State) {
  const glyph = [
    "",
    "╵",
    "╶",
    "└",
    "╷",
    "│",
    "┌",
    "├",
    "╴",
    "┘",
    "─",
    "┴",
    "┐",
    "┤",
    "┬",
    "┼",
  ];
  return {
    columns: 5,
    cells: s.walls.map((w, i) => ({
      key: String(i),
      label: s.positions.includes(i)
        ? s.positions
            .flatMap((p, j) => (p === i ? ["J" + (j + 1)] : []))
            .join(", ")
        : i === s.goals[s.turn]
          ? "Tesoro"
          : "·",
      symbol: glyph[w],
      owner: s.positions.includes(i) ? s.positions.indexOf(i) : undefined,
      action:
        s.phase === "move" && reachable(s).includes(i)
          ? "move:" + i
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
