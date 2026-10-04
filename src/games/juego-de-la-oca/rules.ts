import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { valid, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  positions: number[];
  wait: number[];
  well: number;
  prison: number;
  roll: number[];
  first: boolean[];
}
export const geese = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];
export function initial(players = 2): State {
  return {
    positions: Array(players).fill(0),
    wait: Array(players).fill(0),
    well: -1,
    prison: -1,
    roll: [],
    first: Array(players).fill(true),
    scores: Array(players).fill(0),
    turn: 0,
    winner: null,
    step: 0,
    message: "Lanza dos dados. Llegada exacta a la casa 63.",
  };
}
export const actions = (s: State): BoardAction[] =>
  s.winner !== null
    ? []
    : [
        {
          from: -1,
          to: -1,
          tool: 0,
          label:
            s.wait[s.turn] || s.well === s.turn
              ? "Cumplir espera"
              : "Lanzar dos dados",
        },
      ];
export function travel(pos: number, amount: number, direction = 1) {
  for (let i = 0; i < amount; i++) {
    if (pos === 63 && direction === 1) direction = -1;
    if (pos === 0 && direction === -1) direction = 1;
    pos += direction;
  }
  return { pos, direction };
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    positions: [...s.positions],
    wait: [...s.wait],
    first: [...s.first],
    scores: [...s.scores],
    step: s.step + 1,
  };
  const p = s.turn;
  let extra = false;
  if (n.wait[p] > 0) {
    n.wait[p]--;
    if (n.prison === p && n.wait[p] === 0) n.prison = -1;
    n.message = "J" + (p + 1) + " cumple una espera; faltan " + n.wait[p] + ".";
  } else if (n.well === p) {
    n.message =
      "J" + (p + 1) + " espera en el pozo hasta que llegue otra ficha.";
  } else {
    n.roll = [
      1 + Math.floor(Math.random() * 6),
      1 + Math.floor(Math.random() * 6),
    ];
    const sum = n.roll[0] + n.roll[1];
    let t = travel(n.positions[p], sum);
    if (n.first[p] && sum === 9)
      t = { pos: n.roll.includes(3) ? 26 : 53, direction: 1 };
    n.first[p] = false;
    if (geese.includes(t.pos)) {
      extra = true;
      let guard = 0;
      while (geese.includes(t.pos) && guard++ < 20)
        t = travel(t.pos, sum, t.direction);
    }
    let to = t.pos;
    if (to === 6 || to === 12) {
      to = to === 6 ? 12 : 6;
      extra = true;
    } else if (to === 19) n.wait[p] = 2;
    else if (to === 31) {
      if (n.well >= 0) n.well = -1;
      n.well = p;
    } else if (to === 42) to = 30;
    else if (to === 52) {
      if (n.prison >= 0) {
        n.wait[n.prison] = 0;
        n.prison = -1;
      }
      n.prison = p;
      n.wait[p] = 3;
    } else if (to === 58) to = 0;
    n.positions[p] = to;
    n.scores = [...n.positions];
    n.message =
      "Dados " +
      n.roll.join(" + ") +
      " · casa " +
      to +
      (extra ? " · repites tirada" : "") +
      (n.wait[p] ? " · espera " + n.wait[p] + " turnos" : "") +
      (n.well === p ? " · pozo" : "");
    if (to === 63) n.winner = p;
  }
  n.turn = extra ? p : (p + 1) % n.positions.length;
  return n;
}
export const tools = () => [{ key: 0, label: "Dados / espera" }];
const spiral: Point[] = [];
let l = 0,
  r = 8,
  t = 0,
  b = 6;
while (l <= r && t <= b) {
  for (let x = l; x <= r; x++) spiral.push([x, t]);
  t++;
  for (let y = t; y <= b; y++) spiral.push([r, y]);
  r--;
  if (t <= b) {
    for (let x = r; x >= l; x--) spiral.push([x, b]);
    b--;
  }
  if (l <= r) {
    for (let y = b; y >= t; y--) spiral.push([l, y]);
    l++;
  }
}
export const board = (s: State) => ({
  columns: 9,
  cells: Array.from({ length: 63 }, (_, i) => {
    const key = spiral.findIndex(([x, y]) => y * 9 + x === i) + 1,
      players = s.positions.flatMap((pos, p) => (pos === key ? [p] : []));
    const symbols: Record<number, string> = {
      6: "橋",
      12: "橋",
      19: "⌂",
      31: "◉",
      42: "↩",
      52: "▥",
      58: "☠",
      63: "★",
    };
    return {
      key,
      text:
        (players.length
          ? players.map((p) => "●" + (p + 1)).join(" ")
          : geese.includes(key)
            ? "♧"
            : symbols[key] || "") +
        " " +
        key,
      owner: players[0],
      label:
        "Casa " +
        key +
        (players.length
          ? " · " + players.map((p) => "J" + (p + 1)).join(", ")
          : ""),
      color: geese.includes(key)
        ? "#b8c4a0"
        : symbols[key]
          ? "#c5b79b"
          : undefined,
    };
  }),
});
export const automatic = (s: State) => apply(s, actions(s)[0]);
