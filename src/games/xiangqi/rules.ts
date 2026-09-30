import { searchMove } from "../../shared/search";
export type Move = { from: number; to: number };
export type State = {
  board: number[];
  turn: number;
  quiet: number;
  history: { key: string; mover: number; check: boolean }[];
};
export const owner = (v: number) => (v > 0 ? 1 : v < 0 ? 2 : 0);
export const names = [
  "",
  "Soldado",
  "Elefante",
  "Consejero",
  "Caballo",
  "Cañón",
  "Carro",
  "General",
];
export const redSymbols = ["", "兵", "相", "仕", "傌", "炮", "俥", "帥"],
  blackSymbols = ["", "卒", "象", "士", "馬", "砲", "車", "將"];
export const key = (s: State) => s.board.join(",") + ":" + s.turn;
const palace = (r: number, c: number, p: number) =>
  c >= 3 && c <= 5 && (p === 1 ? r >= 7 : r <= 2);
export function initial(): State {
  const board = Array(90).fill(0),
    row = [6, 4, 2, 3, 7, 3, 2, 4, 6];
  for (let c = 0; c < 9; c++) {
    board[c] = -row[c];
    board[81 + c] = row[c];
  }
  board[19] = board[25] = -5;
  board[64] = board[70] = 5;
  for (let c = 0; c < 9; c += 2) {
    board[27 + c] = -1;
    board[54 + c] = 1;
  }
  const s: State = { board, turn: 1, quiet: 0, history: [] };
  s.history = [{ key: key(s), mover: 0, check: false }];
  return s;
}
export function attacks(b: number[], i: number): number[] {
  const v = b[i],
    p = owner(v),
    t = Math.abs(v),
    r = Math.floor(i / 9),
    c = i % 9,
    targets: number[] = [];
  if (!v) return [];
  const add = (rr: number, cc: number) => {
    if (rr >= 0 && rr < 10 && cc >= 0 && cc < 9) targets.push(rr * 9 + cc);
  };
  if (t === 1) {
    add(r + (p === 1 ? -1 : 1), c);
    if (p === 1 ? r <= 4 : r >= 5) {
      add(r, c - 1);
      add(r, c + 1);
    }
  }
  if (t === 2)
    for (const dr of [-2, 2])
      for (const dc of [-2, 2]) {
        const rr = r + dr,
          cc = c + dc;
        if (
          rr >= 0 &&
          rr < 10 &&
          cc >= 0 &&
          cc < 9 &&
          (p === 1 ? rr >= 5 : rr <= 4) &&
          !b[(r + dr / 2) * 9 + c + dc / 2]
        )
          add(rr, cc);
      }
  if (t === 3)
    for (const dr of [-1, 1])
      for (const dc of [-1, 1])
        if (palace(r + dr, c + dc, p)) add(r + dr, c + dc);
  if (t === 4)
    for (const [dr, dc] of [
      [-2, -1],
      [-2, 1],
      [2, -1],
      [2, 1],
      [-1, -2],
      [1, -2],
      [-1, 2],
      [1, 2],
    ]) {
      const lr = r + (Math.abs(dr) === 2 ? dr / 2 : 0),
        lc = c + (Math.abs(dc) === 2 ? dc / 2 : 0);
      if (!b[lr * 9 + lc]) add(r + dr, c + dc);
    }
  if (t === 7) {
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      if (palace(r + dr, c + dc, p)) add(r + dr, c + dc);
    for (const dr of [-1, 1]) {
      let rr = r + dr;
      while (rr >= 0 && rr < 10) {
        const j = rr * 9 + c;
        if (b[j]) {
          if (Math.abs(b[j]) === 7 && owner(b[j]) !== p) targets.push(j);
          break;
        }
        rr += dr;
      }
    }
  }
  if (t === 5 || t === 6)
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      let rr = r + dr,
        cc = c + dc,
        screen = false;
      while (rr >= 0 && rr < 10 && cc >= 0 && cc < 9) {
        const j = rr * 9 + cc;
        if (t === 6) {
          targets.push(j);
          if (b[j]) break;
        } else if (!screen) {
          if (b[j]) screen = true;
          else targets.push(j);
        } else if (b[j]) {
          targets.push(j);
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
  return targets;
}
export function checked(s: State, p = s.turn) {
  const k = s.board.findIndex((v) => owner(v) === p && Math.abs(v) === 7);
  return (
    k < 0 ||
    s.board.some(
      (v, i) => owner(v) === 3 - p && attacks(s.board, i).includes(k),
    )
  );
}
export function apply(s: State, m: Move, record = true): State {
  const board = [...s.board],
    capture = board[m.to];
  board[m.to] = board[m.from];
  board[m.from] = 0;
  const n: State = {
    board,
    turn: 3 - s.turn,
    quiet: capture ? 0 : s.quiet + 1,
    history: s.history,
  };
  if (record)
    n.history = [
      ...s.history,
      { key: key(n), mover: s.turn, check: checked(n, n.turn) },
    ];
  return n;
}
export function legal(s: State): Move[] {
  const result: Move[] = [];
  for (let from = 0; from < 90; from++)
    if (owner(s.board[from]) === s.turn)
      for (const to of attacks(s.board, from))
        if (owner(s.board[to]) !== s.turn && Math.abs(s.board[to]) !== 7) {
          const m = { from, to };
          if (!checked(apply(s, m, false), s.turn)) result.push(m);
        }
  return result;
}
export function result(s: State): string | null {
  if (!legal(s).length) return "Ganan " + (s.turn === 1 ? "negras" : "rojas");
  if (s.quiet >= 100) return "Tablas · sin capturas";
  const indexes = s.history
    .map((h, i) => (h.key === key(s) ? i : -1))
    .filter((i) => i >= 0);
  if (indexes.length >= 3) {
    const cycle = s.history.slice(indexes.at(-3)! + 1),
      offenders = [1, 2].filter((p) => {
        const own = cycle.filter((h) => h.mover === p);
        return own.length && own.every((h) => h.check);
      });
    if (offenders.length === 1)
      return (
        "Pierden " +
        (offenders[0] === 1 ? "rojas" : "negras") +
        " por jaque perpetuo"
      );
    return "Repetición · revisión";
  }
  return null;
}
export function bestMove(s: State, depth = 2) {
  const values = [0, 130, 220, 220, 500, 550, 1000, 20000];
  return searchMove(s, {
    legal,
    next: (p, m) => apply(p, m, false),
    turn: (p) => p.turn,
    depth,
    limit: 16000,
    value: (p) =>
      p.board.reduce(
        (n, v, i) =>
          n +
          (!v
            ? 0
            : (v < 0 ? 1 : -1) *
              (values[Math.abs(v)] +
                (Math.abs(v) === 1
                  ? (v > 0 ? 9 - Math.floor(i / 9) : Math.floor(i / 9)) * 8
                  : 0))),
        0,
      ),
  });
}
