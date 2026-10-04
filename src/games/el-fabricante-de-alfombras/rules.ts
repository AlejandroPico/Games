import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  board: number[];
  position: number;
  heading: number;
  coins: number[];
  phase: "walk" | "lay";
  roll: number;
  round: number;
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Escoge dirección y camina",
    board: Array(49).fill(-1),
    position: 24,
    heading: 0,
    coins: Array(n).fill(20),
    phase: "walk",
    roll: 0,
    round: 1,
  };
}
function adj(i: number): number[] {
  return [
    i % 7 ? i - 1 : -1,
    i % 7 < 6 ? i + 1 : -1,
    i >= 7 ? i - 7 : -1,
    i < 42 ? i + 7 : -1,
  ].filter((i) => i >= 0);
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "walk")
    return [-1, 0, 1].map((d) => ({
      key: "walk:" + d,
      label:
        d < 0
          ? "Girar a izquierda y tirar"
          : d > 0
            ? "Girar a derecha y tirar"
            : "Seguir recto y tirar",
    }));
  const a: { key: string; label: string }[] = [],
    seen = new Set<string>();
  for (const i of adj(s.position))
    for (const j of adj(i))
      if (j !== s.position) {
        const pair = [i, j].sort((a, b) => a - b),
          key = "lay:" + pair.join(",");
        if (!seen.has(key)) {
          seen.add(key);
          a.push({
            key,
            label: "Extender alfombra " + (pair[0] + 1) + "–" + (pair[1] + 1),
          });
        }
      }
  return a.length ? a : [{ key: "skip", label: "Sin hueco: pasar" }];
}
function region(s: State, start: number): number {
  const owner = s.board[start],
    q = [start],
    seen = new Set(q);
  for (let i = 0; i < q.length; i++)
    for (const j of adj(q[i]))
      if (s.board[j] === owner && !seen.has(j)) {
        seen.add(j);
        q.push(j);
      }
  return q.length;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [a, raw] = key.split(":");
  t.step++;
  if (a === "walk") {
    t.heading = (t.heading + Number(raw) + 4) % 4;
    t.roll = pick([1, 2, 2, 3, 3, 4]);
    for (let k = 0; k < t.roll; k++) {
      const delta = [-7, 1, 7, -1][t.heading],
        next = t.position + delta;
      if (
        next < 0 ||
        next >= 49 ||
        Math.abs((next % 7) - (t.position % 7)) +
          Math.abs(Math.floor(next / 7) - Math.floor(t.position / 7)) !==
          1
      ) {
        t.heading = (t.heading + 2) % 4;
        t.position += [-7, 1, 7, -1][t.heading];
      } else t.position = next;
    }
    const owner = t.board[t.position];
    if (owner >= 0 && owner !== p) {
      const tax = Math.min(t.coins[p], region(t, t.position));
      t.coins[p] -= tax;
      t.coins[owner] += tax;
      t.message =
        "Dado " + t.roll + " · pagas " + tax + " monedas a J" + (owner + 1);
    } else t.message = "Dado " + t.roll + " · coloca tu alfombra";
    t.phase = "lay";
  } else {
    if (a === "lay") for (const i of raw.split(",").map(Number)) t.board[i] = p;
    t.turn = (p + 1) % t.scores.length;
    t.phase = "walk";
    if (t.turn === 0) t.round++;
    if (t.round > 12) {
      t.scores = t.coins.map(
        (v, i) => v + t.board.filter((p) => p === i).length,
      );
      t.winner = champion(t.scores);
    } else t.message = "Escoge dirección y camina";
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (s.phase === "walk") return apply(s, pick(a).key);
  const value = (key: string) =>
    key === "skip"
      ? -100
      : key
          .split(":")[1]
          .split(",")
          .map(Number)
          .reduce(
            (v, i) =>
              v +
              (s.board[i] === s.turn ? 0 : 1) +
              adj(i).filter((j) => s.board[j] === s.turn).length,
            0,
          );
  return apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    cards: s.coins.map((v, i) => ({
      key: String(i),
      label: "J" + (i + 1) + " · " + v + " monedas",
      icon: "◉",
    })),
    notes: [
      "Ronda " +
        s.round +
        "/12. El comerciante rebota 180° en un borde. Girar 180° voluntariamente no está permitido.",
      "Si termina sobre alfombra rival, paga el tamaño de su región conectada, hasta su saldo. Después cubre dos casillas vecinas junto al comerciante.",
      "La alfombra puede cubrir casillas anteriores, nunca al comerciante. Final: saldo + casillas visibles. Edición original sobre tablero 7×7.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 7,
    cells: s.board.map((p, i) => ({
      key: String(i),
      label: i === s.position ? "Comerciante" : p >= 0 ? "J" + (p + 1) : "·",
      symbol:
        i === s.position ? ["↑", "→", "↓", "←"][s.heading] : p >= 0 ? "▥" : "·",
      owner: p >= 0 ? p : undefined,
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
