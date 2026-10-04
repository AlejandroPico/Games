import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  roles: boolean[];
  board: number[];
  hands: number[][];
  deck: number[];
  round: number;
}
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
  ],
  bits = [1, 2, 4, 8],
  dx = [0, 1, 0, -1],
  dy = [-1, 0, 1, 0];
function rotate(p: number): number {
  return ((p << 1) & 15) | (p >> 3);
}
export function connected(s: State): number[] {
  const q = [10],
    seen = new Set(q);
  for (let k = 0; k < q.length; k++)
    for (let d = 0; d < 4; d++) {
      const i = q[k],
        x = (i % 5) + dx[d],
        y = Math.floor(i / 5) + dy[d],
        j = y * 5 + x;
      if (
        x >= 0 &&
        x < 5 &&
        y >= 0 &&
        y < 5 &&
        s.board[i] & bits[d] &&
        s.board[j] & bits[(d + 2) % 4] &&
        !seen.has(j)
      ) {
        seen.add(j);
        q.push(j);
      }
    }
  return q;
}
export function initial(n: number): State {
  const deck = shuffle(
      Array.from({ length: 60 }, (_, i) =>
        i % 7 === 0 ? 16 : pick([10, 5, 3, 6, 9, 12, 15]),
      ),
    ),
    board = Array(25).fill(0);
  board[10] = 10;
  board[14] = 10;
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Extiende el túnel o descarta una carta",
    roles: shuffle(
      Array.from({ length: n }, (_, i) => i < Math.max(1, Math.floor(n / 3))),
    ),
    board,
    hands: Array.from({ length: n }, () => deck.splice(0, 4)),
    deck,
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const reach = connected(s),
    a: { key: string; label: string }[] = [];
  s.hands[s.turn].forEach((card, k) => {
    a.push({ key: "discard:" + k, label: "Descartar carta " + (k + 1) });
    if (card === 16) {
      s.board.forEach((p, i) => {
        if (p && i !== 10 && i !== 14)
          a.push({
            key: "collapse:" + k + "," + i,
            label: "Derrumbar sector " + (i + 1),
          });
      });
      return;
    }
    let p = card;
    const seen = new Set<number>();
    for (let r = 0; r < 4; r++, p = rotate(p)) {
      if (seen.has(p)) continue;
      seen.add(p);
      s.board.forEach((v, i) => {
        if (v) return;
        const x = i % 5,
          y = Math.floor(i / 5);
        let connection = false,
          valid = true;
        for (let d = 0; d < 4; d++) {
          const nx = x + dx[d],
            ny = y + dy[d],
            j = ny * 5 + nx;
          if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) {
            if (p & bits[d]) valid = false;
            continue;
          }
          if (s.board[j]) {
            if (!!(p & bits[d]) !== !!(s.board[j] & bits[(d + 2) % 4]))
              valid = false;
            if (
              reach.includes(j) &&
              p & bits[d] &&
              s.board[j] & bits[(d + 2) % 4]
            )
              connection = true;
          }
        }
        if (valid && connection)
          a.push({
            key: "lay:" + k + "," + i + "," + p,
            label:
              "Carta " + (k + 1) + " " + glyph[p] + " en sector " + (i + 1),
          });
      });
    }
  });
  return a.length ? a : [{ key: "pass", label: "Pasar sin cartas" }];
}
function end(t: State, bad: boolean) {
  t.scores = t.roles.map((r) => (r === bad ? 1 : 0));
  t.winner = t.roles.indexOf(bad);
  t.outcome = bad ? "Ganan los saboteadores" : "Ganan los mineros";
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    [a, raw] = key.split(":"),
    [k, i, p] = (raw || "").split(",").map(Number);
  if (a !== "pass") {
    t.hands[t.turn].splice(k, 1);
    if (a === "lay") t.board[i] = p;
    if (a === "collapse") t.board[i] = 0;
    if (t.deck.length) t.hands[t.turn].push(t.deck.shift()!);
  }
  t.step++;
  if (connected(t).includes(14)) end(t, false);
  else if (t.step >= 80 || (!t.deck.length && t.hands.every((h) => !h.length)))
    end(t, true);
  t.turn = (t.turn + 1) % t.scores.length;
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    bad = s.roles[s.turn],
    collapse = a.find(
      (a) =>
        a.key.startsWith("collapse:") &&
        connected(s).includes(Number(a.key.split(":")[1].split(",")[1])),
    );
  if (bad && collapse) return apply(s, collapse.key);
  const lays = a.filter((a) => a.key.startsWith("lay:"));
  if (lays.length) {
    const value = (key: string) => {
      const i = Number(key.split(":")[1].split(",")[1]),
        p = Number(key.split(":")[1].split(",")[2]),
        distance = Math.abs((i % 5) - 4) + Math.abs(Math.floor(i / 5) - 2);
      return bad
        ? distance + (p === 15 ? -5 : 1)
        : -distance + (p === 15 ? 1 : 0);
    };
    return apply(s, lays.sort((a, b) => value(b.key) - value(a.key))[0].key);
  }
  return apply(s, a[0].key);
}
export function view(s: State) {
  return {
    private:
      "Tu oficio secreto: " + (s.roles[s.turn] ? "Saboteador" : "Minero"),
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: c === 16 ? "Derrumbe" : "Túnel " + glyph[c],
      icon: c === 16 ? "×" : glyph[c],
    })),
    notes: [
      "Entrada sector 11; oro sector 15. Mazo " +
        s.deck.length +
        " · límite 80 acciones.",
      "Al colocar, todos los contactos con túneles existentes deben coincidir y al menos uno conectar con la entrada. No se abren salidas fuera del tablero.",
      "Los oficios no se muestran a rivales; la IA solo conoce el suyo. Esta edición original no reproduce la baraja de otro editor.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 5,
    cells: s.board.map((p, i) => ({
      key: String(i),
      label: i === 10 ? "Entrada" : i === 14 ? "Oro" : "·",
      symbol: p ? glyph[p] : "·",
      detail: i === 14 ? "◆" : undefined,
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
