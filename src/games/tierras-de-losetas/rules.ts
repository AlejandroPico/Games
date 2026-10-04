import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Tile {
  kind: number;
  owner: number;
}
export interface State extends DeductionPosition {
  board: (Tile | null)[];
  market: number[];
  held: number | null;
  remaining: number;
}
const names = ["Bosque", "Ciudad", "Pradera"],
  icons = ["♣", "▤", "❀"];
function adjacent(i: number): number[] {
  return [
    i % 6 ? i - 1 : -1,
    i % 6 < 5 ? i + 1 : -1,
    i >= 6 ? i - 6 : -1,
    i < 30 ? i + 6 : -1,
  ].filter((i) => i >= 0);
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Elige una loseta del mercado",
    board: Array(36).fill(null),
    market: Array.from({ length: 3 }, () => Math.floor(Math.random() * 3)),
    held: null,
    remaining: Math.min(36, n * 9),
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.held === null
    ? s.market.map((k, i) => ({ key: "pick:" + i, label: "Tomar " + names[k] }))
    : s.board.flatMap((tile, i) =>
        !tile &&
        (!s.board.some(Boolean)
          ? i === 14
          : adjacent(i).some((j) => s.board[j]))
          ? [
              {
                key: "place:" + i,
                label:
                  "Colocar en F" +
                  (Math.floor(i / 6) + 1) +
                  "C" +
                  ((i % 6) + 1),
              },
            ]
          : [],
      );
}
function final(s: State) {
  for (let p = 0; p < s.scores.length; p++) {
    let best = 0;
    const seen = new Set<number>();
    s.board.forEach((tile, i) => {
      if (tile?.owner !== p || seen.has(i)) return;
      const q = [i];
      seen.add(i);
      for (let k = 0; k < q.length; k++)
        for (const j of adjacent(q[k]))
          if (
            s.board[j]?.owner === p &&
            s.board[j]?.kind === tile.kind &&
            !seen.has(j)
          ) {
            seen.add(j);
            q.push(j);
          }
      best = Math.max(best, q.length);
    });
    s.scores[p] += 2 * best;
  }
  s.winner = champion(s.scores);
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    [a, raw] = key.split(":"),
    i = Number(raw);
  t.step++;
  if (a === "pick") {
    t.held = t.market[i];
    t.market[i] = Math.floor(Math.random() * 3);
    t.message = "Coloca junto a una loseta existente";
  } else {
    const kind = t.held!;
    t.scores[t.turn] +=
      1 + adjacent(i).filter((j) => t.board[j]?.kind === kind).length;
    t.board[i] = { kind, owner: t.turn };
    t.remaining--;
    t.held = null;
    t.turn = (t.turn + 1) % t.scores.length;
    t.message = "Elige una loseta del mercado";
    if (!t.remaining) final(t);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (!a.length) return s;
  if (s.held === null) {
    const i = s.market
      .map((k, i) => ({
        i,
        v: s.board.filter((t) => t?.owner === s.turn && t.kind === k).length,
      }))
      .sort((a, b) => b.v - a.v)[0].i;
    return apply(s, "pick:" + i);
  }
  return apply(
    s,
    a.sort((a, b) => {
      const value = (key: string) => {
        const i = Number(key.split(":")[1]);
        return adjacent(i).reduce(
          (n, j) =>
            n +
            (s.board[j]?.kind === s.held ? 3 : 0) +
            (s.board[j]?.owner === s.turn ? 1 : 0),
          0,
        );
      };
      return value(b.key) - value(a.key);
    })[0].key,
  );
}
export function view(s: State) {
  return {
    cards: s.market.map((k, i) => ({
      key: String(i),
      label: names[k],
      icon: icons[k],
      action: s.held === null ? "pick:" + i : undefined,
    })),
    notes: [
      "Quedan " +
        s.remaining +
        " losetas. Cada colocación puntúa 1 + vecinos del mismo paisaje.",
      "Final: cada bando añade dos puntos por loseta de su mayor región propia de un mismo paisaje.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 6,
    cells: s.board.map((t, i) => ({
      key: String(i),
      label: t
        ? names[t.kind] + " · J" + (t.owner + 1)
        : "F" + (Math.floor(i / 6) + 1) + "C" + ((i % 6) + 1),
      symbol: t ? icons[t.kind] : "·",
      owner: t?.owner,
      action: actions(s).some((a) => a.key === "place:" + i)
        ? "place:" + i
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
