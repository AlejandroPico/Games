import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { valid } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  seeds: number[];
  history: string[];
}
export function initial(): State {
  return {
    seeds: Array(12).fill(4),
    scores: [0, 0],
    turn: 0,
    winner: null,
    step: 0,
    history: [],
    message:
      "Siembra en sentido antihorario. Debes alimentar al rival si no tiene semillas.",
  };
}
function sow(b: number[], from: number) {
  const out = [...b];
  let remaining = out[from],
    i = from;
  out[from] = 0;
  while (remaining) {
    i = (i + 1) % 12;
    if (i === from) continue;
    out[i]++;
    remaining--;
  }
  return { seeds: out, last: i };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const enemy = (1 - s.turn) * 6;
  const empty = s.seeds.slice(enemy, enemy + 6).every((v) => !v);
  return s.seeds.flatMap((v, from) =>
    Math.floor(from / 6) === s.turn &&
    v > 0 &&
    (!empty ||
      sow(s.seeds, from)
        .seeds.slice(enemy, enemy + 6)
        .some((v) => v > 0))
      ? [{ from: -1, to: from, tool: 0 }]
      : [],
  );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const move = sow(s.seeds, a.to),
    n = {
      ...s,
      seeds: move.seeds,
      scores: [...s.scores],
      history: [...s.history],
      turn: 1 - s.turn,
      step: s.step + 1,
    };
  let i = move.last,
    caps: number[] = [];
  while (
    Math.floor(i / 6) === 1 - s.turn &&
    (n.seeds[i] === 2 || n.seeds[i] === 3)
  ) {
    caps.push(i);
    i = (i + 11) % 12;
  }
  const total = caps.reduce((v, i) => v + n.seeds[i], 0),
    enemy = n.seeds
      .slice((1 - s.turn) * 6, (2 - s.turn) * 6)
      .reduce((a, b) => a + b, 0);
  if (total < enemy) {
    n.scores[s.turn] += total;
    caps.forEach((i) => (n.seeds[i] = 0));
  }
  if (n.scores[s.turn] > 24) n.winner = s.turn;
  const key = n.seeds.join() + n.turn;
  n.history.push(key);
  if (
    n.winner === null &&
    (!actions(n).length ||
      n.history.filter((v) => v === key).length >= 3 ||
      n.step >= 800)
  ) {
    for (let p = 0; p < 2; p++)
      n.scores[p] += n.seeds.slice(p * 6, p * 6 + 6).reduce((a, b) => a + b, 0);
    n.seeds.fill(0);
    n.winner =
      n.scores[0] === n.scores[1] ? -1 : n.scores[0] > n.scores[1] ? 0 : 1;
  }
  n.message =
    "Elige un cuenco propio. Capturas solo grupos finales de dos o tres; una gran cosecha no captura.";
  return n;
}
export const tools = () => [{ key: 0, label: "Sembrar cuenco" }];
export const board = (s: State) => ({
  columns: 6,
  cells: [11, 10, 9, 8, 7, 6, 0, 1, 2, 3, 4, 5].map((key) => ({
    key,
    text: String(s.seeds[key]),
    owner: Math.floor(key / 6),
    label:
      "Cuenco J" +
      (Math.floor(key / 6) + 1) +
      " número " +
      ((key % 6) + 1) +
      ": " +
      s.seeds[key] +
      " semillas",
  })),
});
export const automatic = (s: State) => {
  const acts = actions(s);
  if (!acts.length) return s;
  let best = acts[0],
    v = -Infinity;
  for (const a of acts) {
    const n = apply(s, a),
      p = s.turn;
    let score = n.winner === p ? 1e6 : n.scores[p] - n.scores[1 - p];
    if (n.winner === null) {
      const replies = actions(n).map((b) => {
        const x = apply(n, b);
        return x.winner === 1 - p ? -1e6 : x.scores[p] - x.scores[1 - p];
      });
      if (replies.length) score = Math.min(...replies);
    }
    score += Math.random() * 0.1;
    if (score > v) {
      v = score;
      best = a;
    }
  }
  return apply(s, best);
};
