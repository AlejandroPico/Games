import { searchMove } from "../../shared/search";
export type Move = {
  from: number;
  to: number;
  promote?: boolean;
  drop?: number;
};
export type Entry = { key: string; mover: number; check: boolean };
export type State = {
  board: number[];
  hands: number[][];
  turn: number;
  history: Entry[];
};
export const base = (v: number) =>
  Math.abs(v) > 8 ? Math.abs(v) - 8 : Math.abs(v);
export const owner = (v: number) => (v > 0 ? 1 : v < 0 ? 2 : 0);
export const key = (s: State) =>
  s.board.join(",") +
  "|" +
  s.hands.map((h) => h.join(",")).join("|") +
  ":" +
  s.turn;
export const names = [
  "",
  "Peón",
  "Lanza",
  "Caballo",
  "Plata",
  "Oro",
  "Alfil",
  "Torre",
  "Rey",
];
export const symbols = [
  "",
  "歩",
  "香",
  "桂",
  "銀",
  "金",
  "角",
  "飛",
  "玉",
  "と",
  "杏",
  "圭",
  "全",
  "",
  "馬",
  "龍",
];
const zone = (i: number, p: number) =>
  p === 1 ? Math.floor(i / 9) < 3 : Math.floor(i / 9) > 5;
export function initial(): State {
  const board = Array(81).fill(0),
    row = [2, 3, 4, 5, 8, 5, 4, 3, 2];
  for (let c = 0; c < 9; c++) {
    board[c] = -row[c];
    board[72 + c] = row[c];
    board[18 + c] = -1;
    board[54 + c] = 1;
  }
  board[10] = -7;
  board[16] = -6;
  board[64] = 6;
  board[70] = 7;
  const s: State = {
    board,
    hands: [Array(9).fill(0), Array(9).fill(0)],
    turn: 1,
    history: [],
  };
  s.history = [{ key: key(s), mover: 0, check: false }];
  return s;
}
export function attacks(board: number[], i: number): number[] {
  const value = board[i];
  if (!value) return [];
  const p = owner(value),
    f = p === 1 ? -1 : 1,
    t = Math.abs(value),
    r = Math.floor(i / 9),
    c = i % 9,
    result: number[] = [];
  const step = (dr: number, dc: number, ray = false) => {
    let rr = r + dr,
      cc = c + dc;
    while (rr >= 0 && rr < 9 && cc >= 0 && cc < 9) {
      const j = rr * 9 + cc;
      result.push(j);
      if (!ray || board[j]) break;
      rr += dr;
      cc += dc;
    }
  };
  if (t === 1) step(f, 0);
  else if (t === 2) step(f, 0, true);
  else if (t === 3) {
    step(2 * f, -1);
    step(2 * f, 1);
  } else if (t === 4) {
    for (const [a, b] of [
      [f, -1],
      [f, 0],
      [f, 1],
      [-f, -1],
      [-f, 1],
    ])
      step(a, b);
  } else if (t === 5 || (t >= 9 && t <= 12)) {
    for (const [a, b] of [
      [f, -1],
      [f, 0],
      [f, 1],
      [0, -1],
      [0, 1],
      [-f, 0],
    ])
      step(a, b);
  } else if (t === 8) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) if (dr || dc) step(dr, dc);
  } else if (t === 6 || t === 14) {
    for (const dr of [-1, 1]) for (const dc of [-1, 1]) step(dr, dc, true);
    if (t === 14)
      for (const [a, b] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
        step(a, b);
  } else if (t === 7 || t === 15) {
    for (const [a, b] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      step(a, b, true);
    if (t === 15)
      for (const dr of [-1, 1]) for (const dc of [-1, 1]) step(dr, dc);
  }
  return result;
}
export function checked(s: State, p = s.turn): boolean {
  const king = s.board.findIndex((v) => owner(v) === p && base(v) === 8);
  return (
    king < 0 ||
    s.board.some(
      (v, i) => owner(v) === 3 - p && attacks(s.board, i).includes(king),
    )
  );
}
export function apply(s: State, m: Move, record = true): State {
  const board = [...s.board],
    hands = s.hands.map((h) => [...h]),
    sign = s.turn === 1 ? 1 : -1;
  if (m.drop) {
    hands[s.turn - 1][m.drop]--;
    board[m.to] = sign * m.drop;
  } else {
    if (board[m.to]) hands[s.turn - 1][base(board[m.to])]++;
    const v = board[m.from];
    board[m.from] = 0;
    board[m.to] = m.promote ? sign * (base(v) + 8) : v;
  }
  const n: State = { board, hands, turn: 3 - s.turn, history: s.history };
  if (record)
    n.history = [
      ...s.history,
      { key: key(n), mover: s.turn, check: checked(n, n.turn) },
    ];
  return n;
}
export function legal(s: State, skipPawnMate = false): Move[] {
  const p = s.turn,
    all: Move[] = [],
    last = p === 1 ? 0 : 8;
  for (let from = 0; from < 81; from++)
    if (owner(s.board[from]) === p) {
      const v = Math.abs(s.board[from]),
        b = base(v);
      for (const to of attacks(s.board, from)) {
        if (owner(s.board[to]) === p || base(s.board[to]) === 8) continue;
        const promotable = v <= 7 && v !== 5 && (zone(from, p) || zone(to, p)),
          r = Math.floor(to / 9),
          forced =
            v <= 3 && (r === last || (v === 3 && r === (p === 1 ? 1 : 7)));
        if (!forced) all.push({ from, to });
        if (promotable) all.push({ from, to, promote: true });
      }
    }
  for (let drop = 1; drop <= 7; drop++)
    if (s.hands[p - 1][drop] > 0)
      for (let to = 0; to < 81; to++) {
        if (s.board[to]) continue;
        const r = Math.floor(to / 9),
          c = to % 9;
        if (
          (drop <= 3 && r === last) ||
          (drop === 3 && r === (p === 1 ? 1 : 7))
        )
          continue;
        if (
          drop === 1 &&
          s.board.some(
            (v, i) => owner(v) === p && Math.abs(v) === 1 && i % 9 === c,
          )
        )
          continue;
        all.push({ from: -1, to, drop });
      }
  return all.filter((m) => {
    const n = apply(s, m, false);
    if (checked(n, p)) return false;
    if (
      m.drop === 1 &&
      !skipPawnMate &&
      checked(n, n.turn) &&
      !legal(n, true).length
    )
      return false;
    return true;
  });
}
export function result(s: State): string | null {
  if (!legal(s).length) return "Gana " + (s.turn === 1 ? "Gote" : "Sente");
  const occurrences = s.history
    .map((h, i) => (h.key === key(s) ? i : -1))
    .filter((i) => i >= 0);
  if (occurrences.length >= 4) {
    const cycle = s.history.slice(occurrences.at(-4)! + 1);
    for (const p of [1, 2]) {
      const own = cycle.filter((e) => e.mover === p);
      if (own.length && own.every((e) => e.check))
        return "Pierde " + (p === 1 ? "Sente" : "Gote") + " por jaque perpetuo";
    }
    return "Sennichite · repetir partida";
  }
  return null;
}
export function impasse(s: State): string | null {
  if (
    [1, 2].some((p) => {
      const k = s.board.findIndex((v) => owner(v) === p && base(v) === 8);
      return !zone(k, p) || checked(s, p);
    })
  )
    return null;
  const scores = [1, 2].map(
    (p) =>
      s.board.reduce(
        (n, v) =>
          n + (owner(v) === p && base(v) !== 8 ? (base(v) >= 6 ? 5 : 1) : 0),
        0,
      ) +
      s.hands[p - 1].reduce((n, count, t) => n + count * (t >= 6 ? 5 : 1), 0),
  );
  if (scores[0] < 24 && scores[1] < 24) return "Impasse · tablas";
  if (scores[0] < 24) return "Impasse · gana Gote";
  if (scores[1] < 24) return "Impasse · gana Sente";
  return "Impasse · tablas";
}
export function bestMove(s: State, depth = 2) {
  const values = [
    0, 100, 280, 300, 450, 550, 750, 950, 20000, 550, 550, 550, 550, 0, 1100,
    1300,
  ];
  return searchMove(s, {
    legal,
    next: (p, m) => apply(p, m, false),
    turn: (p) => p.turn,
    depth,
    limit: 12000,
    value: (p) =>
      p.board.reduce(
        (n, v) => n + (!v ? 0 : (v < 0 ? 1 : -1) * values[Math.abs(v)]),
        0,
      ) +
      p.hands.reduce(
        (n, h, i) =>
          n +
          (i ? 1 : -1) * h.reduce((v, count, t) => v + count * values[t], 0),
        0,
      ),
  });
}
