import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { valid, pick } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[][];
  roll: number;
  phase: "roll" | "move";
}
export function initial(): State {
  return {
    pieces: [
      [0, 2, 4, 6, 8],
      [1, 3, 5, 7, 9],
    ],
    roll: 0,
    phase: "roll",
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Reconstrucción educativa: cinco fichas, dado de seis caras.",
  };
}
export function destination(s: State, i: number) {
  const pos = s.pieces[s.turn][i];
  if (pos === 30) return -1;
  if (pos === -2) return s.pieces.flat().includes(14) ? -1 : 14;
  if (pos === 27) return s.roll === 3 ? 30 : -1;
  if (pos === 28) return s.roll === 2 ? 30 : -1;
  if (pos === 29) return s.roll === 1 ? 30 : -1;
  const next = pos + s.roll;
  if ((pos < 25 && next > 25) || next > 30) return -1;
  return next;
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "roll")
    return [{ from: -1, to: -1, tool: 0, label: "Lanzar dado" }];
  const a = s.pieces[s.turn].flatMap((pos, i) => {
    const next = destination(s, i);
    return next >= 0 &&
      (next === 30 || !s.pieces[s.turn].some((v, j) => j !== i && v === next))
      ? [
          {
            from: pos < 0 ? -1 : pos,
            to: next === 30 ? 30 + s.turn : next,
            tool: i + 1,
          },
        ]
      : [];
  });
  return a.length
    ? a
    : [{ from: -1, to: -1, tool: 99, label: "Pasar: no hay movimiento" }];
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: s.pieces.map((b) => [...b]),
    scores: [...s.scores],
    step: s.step + 1,
  };
  if (s.phase === "roll") {
    n.roll = 1 + Math.floor(Math.random() * 6);
    n.phase = "move";
    n.message = "Dado: " + n.roll + ". Elige una ficha.";
    return n;
  }
  if (a.tool !== 99) {
    const i = a.tool - 1,
      old = s.pieces[s.turn][i],
      to = destination(s, i);
    if (to < 30) {
      const j = n.pieces[1 - s.turn].indexOf(to);
      if (j >= 0) n.pieces[1 - s.turn][j] = old < 0 ? -2 : old;
    }
    n.pieces[s.turn][i] = to === 26 ? -2 : to;
    n.scores = n.pieces.map((b) => b.filter((v) => v === 30).length);
    if (n.scores[s.turn] === 5) n.winner = s.turn;
  }
  n.phase = "roll";
  n.turn = 1 - s.turn;
  n.message =
    "Lanza el dado. Debes pisar la casa 26 antes de avanzar al tramo final.";
  return n;
}
export const tools = (s: State) =>
  [...new Set(actions(s).map((a) => a.tool))].map((key) => ({
    key,
    label:
      key === 0
        ? "Lanzar"
        : key === 99
          ? "Pasar"
          : "Ficha " +
            key +
            (s.pieces[s.turn][key - 1] === -2 ? " · renacimiento" : ""),
  }));
export const board = (s: State) => ({
  columns: 10,
  cells: Array.from({ length: 40 }, (_, i) => {
    const row = Math.floor(i / 10),
      col = i % 10,
      key = row === 1 ? 19 - col : i;
    const p = key < 30 ? s.pieces.findIndex((b) => b.includes(key)) : -1;
    const marks: Record<number, string> = {
      14: "☥",
      25: "26",
      26: "≈",
      27: "III",
      28: "II",
      29: "I",
      30: "↑",
    };
    return {
      key,
      text: p >= 0 ? "●" : marks[key] || String(key + 1),
      owner: p >= 0 ? p : undefined,
      void: key > 30,
      label:
        key === 30
          ? "Salida del tablero"
          : "Casa " +
            (key + 1) +
            (p >= 0 ? " · J" + (p + 1) : "") +
            (marks[key] ? " · " + marks[key] : ""),
      color: key >= 25 ? "#cab38a" : undefined,
    };
  }),
});
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 100 +
      n.pieces[p].reduce((v, x) => v + Math.max(-8, x), 0) -
      n.pieces[1 - p].reduce((v, x) => v + Math.max(0, x), 0),
  );
