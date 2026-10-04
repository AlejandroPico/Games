import type {
  AbstractPosition,
  BoardAction,
  BoardCell,
} from "../../shared/AbstractTable";
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};
const same = (a: BoardAction, b: BoardAction) =>
  a.from === b.from && a.to === b.to && a.tool === b.tool;

export interface State extends AbstractPosition {
  cells: number[];
  hands: number[][];
  middle: number;
  history: string[];
}
export const cards = [
  {
    name: "Tigre",
    d: [
      [0, -2],
      [0, 1],
    ],
  },
  {
    name: "Dragón",
    d: [
      [-2, -1],
      [2, -1],
      [-1, 1],
      [1, 1],
    ],
  },
  {
    name: "Rana",
    d: [
      [-2, 0],
      [-1, -1],
      [1, 1],
    ],
  },
  {
    name: "Conejo",
    d: [
      [2, 0],
      [1, -1],
      [-1, 1],
    ],
  },
  {
    name: "Cangrejo",
    d: [
      [-2, 0],
      [0, -1],
      [2, 0],
    ],
  },
  {
    name: "Elefante",
    d: [
      [-1, 0],
      [-1, -1],
      [1, 0],
      [1, -1],
    ],
  },
  {
    name: "Ganso",
    d: [
      [-1, 0],
      [-1, -1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: "Gallo",
    d: [
      [-1, 0],
      [-1, 1],
      [1, 0],
      [1, -1],
    ],
  },
  {
    name: "Mono",
    d: [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ],
  },
  {
    name: "Mantis",
    d: [
      [-1, -1],
      [1, -1],
      [0, 1],
    ],
  },
  {
    name: "Caballo",
    d: [
      [-1, 0],
      [0, -1],
      [0, 1],
    ],
  },
  {
    name: "Buey",
    d: [
      [1, 0],
      [0, -1],
      [0, 1],
    ],
  },
  {
    name: "Grulla",
    d: [
      [0, -1],
      [-1, 1],
      [1, 1],
    ],
  },
  {
    name: "Jabalí",
    d: [
      [-1, 0],
      [0, -1],
      [1, 0],
    ],
  },
  {
    name: "Anguila",
    d: [
      [-1, -1],
      [1, 0],
      [-1, 1],
    ],
  },
  {
    name: "Cobra",
    d: [
      [1, -1],
      [-1, 0],
      [1, 1],
    ],
  },
];
export function initial(_n = 2, _size = 5): State {
  const pool = cards.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cells = Array(25).fill(0);
  for (let i = 0; i < 5; i++) {
    cells[i] = i === 2 ? 4 : 3;
    cells[20 + i] = i === 2 ? 2 : 1;
  }
  return {
    turn: 0,
    winner: null,
    scores: [5, 5],
    step: 0,
    message: "Elige carta, pieza y destino",
    cells,
    hands: [pool.slice(0, 2), pool.slice(2, 4)],
    middle: pool[4],
    history: [],
  };
}
const owner = (v: number) => (v ? Math.floor((v - 1) / 2) : -1);
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const out: BoardAction[] = [];
  for (const card of s.hands[s.turn])
    for (let from = 0; from < 25; from++)
      if (owner(s.cells[from]) === s.turn)
        for (const [dx, dy] of cards[card].d) {
          const sign = s.turn === 0 ? 1 : -1,
            c = (from % 5) + sign * dx,
            r = Math.floor(from / 5) + sign * dy;
          if (
            c >= 0 &&
            c < 5 &&
            r >= 0 &&
            r < 5 &&
            owner(s.cells[r * 5 + c]) !== s.turn
          )
            out.push({ from, to: r * 5 + c, tool: card });
        }
  if (!out.length)
    for (const card of s.hands[s.turn])
      out.push({ from: -1, to: -1, tool: card });
  return out;
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s),
    p = x.turn;
  x.step++;
  if (a.to >= 0) {
    const value = x.cells[a.from],
      captured = x.cells[a.to];
    x.cells[a.to] = value;
    x.cells[a.from] = 0;
    if (
      captured === (p === 0 ? 4 : 2) ||
      (value === (p === 0 ? 2 : 4) && a.to === (p === 0 ? 2 : 22))
    )
      x.winner = p;
  }
  const slot = x.hands[p].indexOf(a.tool);
  x.hands[p][slot] = x.middle;
  x.middle = a.tool;
  x.turn = 1 - p;
  x.scores = [0, 1].map((p) => x.cells.filter((v) => owner(v) === p).length);
  x.message =
    "Carta central: " + cards[x.middle].name + " · elige una de tus cartas";
  const key =
    x.cells.join(",") +
    "|" +
    x.hands.flat().join(",") +
    "|" +
    x.middle +
    "|" +
    x.turn;
  x.history.push(key);
  if (
    x.winner === null &&
    (x.history.filter((k) => k === key).length >= 3 || x.step >= 300)
  )
    x.winner = -1;
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  let choice = a[0],
    v = -Infinity;
  for (const m of a) {
    const x = apply(s, m),
      p = s.turn;
    let value = x.winner === p ? 10000 : 0;
    if (m.to >= 0) {
      value += s.cells[m.to] ? 100 : 0;
      value += p === 0 ? 4 - Math.floor(m.to / 5) : Math.floor(m.to / 5);
      value += 2 - Math.abs((m.to % 5) - 2);
    }
    if (
      x.winner === null &&
      actions(x).some(
        (b) =>
          b.to >= 0 &&
          (x.cells[b.to] === (p === 0 ? 2 : 4) ||
            (x.cells[b.from] === (p === 0 ? 4 : 2) &&
              b.to === (p === 0 ? 22 : 2))),
      )
    )
      value -= 1000;
    if (x.winner === -1) value -= 50;
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return choice ? apply(s, choice) : s;
}
export const tools = (s: State) =>
  s.hands[s.turn].map((i) => ({
    key: i,
    label:
      cards[i].name +
      " (" +
      cards[i].d.map(([x, y]) => x + "," + y).join(" / ") +
      ")",
  }));
export const board = (s: State) => ({
  columns: 5,
  cells: s.cells.map(
    (v, i): BoardCell => ({
      key: i,
      text: v % 2 === 0 && v ? "王" : v ? "●" : i === 2 || i === 22 ? "⌂" : "",
      owner: v ? owner(v) : undefined,
      label:
        "Casilla " +
        (Math.floor(i / 5) + 1) +
        "," +
        ((i % 5) + 1) +
        (v
          ? " · " + (v % 2 === 0 ? "maestro" : "alumno") + " J" + (owner(v) + 1)
          : ""),
    }),
  ),
});
