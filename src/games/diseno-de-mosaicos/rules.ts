import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  pool: number[];
  lines: { color: number; count: number }[][];
  walls: boolean[][];
  floor: number[];
  round: number;
}
const names = ["Azul", "Ocre", "Rojo", "Negro", "Blanco"],
  glyph = ["◆", "✧", "✿", "▣", "◇"];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Elige un color y una fila de patrón",
    pool: Array(5).fill(n + 2),
    lines: Array.from({ length: n }, () =>
      Array.from({ length: 5 }, () => ({ color: -1, count: 0 })),
    ),
    walls: Array.from({ length: n }, () => Array(25).fill(false)),
    floor: Array(n).fill(0),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const a: { key: string; label: string }[] = [];
  for (let c = 0; c < 5; c++)
    if (s.pool[c]) {
      for (let r = 0; r < 5; r++)
        if (
          !s.walls[s.turn][r * 5 + ((r + c) % 5)] &&
          (s.lines[s.turn][r].color < 0 || s.lines[s.turn][r].color === c) &&
          s.lines[s.turn][r].count < r + 1
        )
          a.push({
            key: c + ":" + r,
            label: "Tomar " + s.pool[c] + " " + names[c] + " → fila " + (r + 1),
          });
      a.push({ key: c + ":floor", label: "Tomar " + names[c] + " → suelo" });
    }
  return a;
}
function scoring(t: State) {
  for (let p = 0; p < t.scores.length; p++) {
    for (let r = 0; r < 5; r++) {
      const line = t.lines[p][r];
      if (line.count === r + 1) {
        const x = (r + line.color) % 5,
          i = r * 5 + x;
        t.walls[p][i] = true;
        let h = 1,
          v = 1;
        for (const d of [-1, 1]) {
          for (let c = x + d; c >= 0 && c < 5 && t.walls[p][r * 5 + c]; c += d)
            h++;
          for (let y = r + d; y >= 0 && y < 5 && t.walls[p][y * 5 + x]; y += d)
            v++;
        }
        t.scores[p] +=
          h === 1 && v === 1 ? 1 : (h > 1 ? h : 0) + (v > 1 ? v : 0);
        line.count = 0;
        line.color = -1;
      }
    }
    t.scores[p] = Math.max(0, t.scores[p] - t.floor[p]);
    t.floor[p] = 0;
  }
  if (t.round === 5) {
    for (let p = 0; p < t.scores.length; p++) {
      for (let r = 0; r < 5; r++)
        if (t.walls[p].slice(r * 5, r * 5 + 5).every(Boolean)) t.scores[p] += 2;
      for (let x = 0; x < 5; x++)
        if (
          Array.from({ length: 5 }, (_, r) => t.walls[p][r * 5 + x]).every(
            Boolean,
          )
        )
          t.scores[p] += 7;
      for (let c = 0; c < 5; c++)
        if (
          Array.from(
            { length: 5 },
            (_, r) => t.walls[p][r * 5 + ((r + c) % 5)],
          ).every(Boolean)
        )
          t.scores[p] += 10;
    }
    t.winner = champion(t.scores);
  } else {
    t.round++;
    t.pool = Array(5).fill(t.scores.length + 2);
    t.turn = (t.round - 1) % t.scores.length;
  }
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    [c, r] = key.split(":"),
    color = Number(c),
    amount = t.pool[color],
    p = t.turn;
  t.pool[color] = 0;
  if (r === "floor") t.floor[p] += amount;
  else {
    const row = Number(r),
      l = t.lines[p][row],
      fit = Math.min(row + 1 - l.count, amount);
    l.color = color;
    l.count += fit;
    t.floor[p] += amount - fit;
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (!t.pool.some(Boolean)) scoring(t);
  t.message = "Ronda " + t.round + "/5 · toma todos los azulejos de un color";
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    value = (key: string) => {
      const [c, r] = key.split(":");
      if (r === "floor") return -100;
      const row = Number(r),
        amount = s.pool[Number(c)],
        need = row + 1 - s.lines[s.turn][row].count;
      return (
        Math.min(amount, need) * 3 -
        Math.max(0, amount - need) * 2 +
        (amount >= need ? 4 : 0)
      );
    };
  return a.length
    ? apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key)
    : s;
}
export function view(s: State) {
  return {
    cards: s.pool.map((n, c) => ({
      key: String(c),
      label: n + " " + names[c],
      icon: glyph[c],
      excluded: !n,
    })),
    notes: [
      "J" +
        (s.turn + 1) +
        " patrones: " +
        s.lines[s.turn]
          .map(
            (l, r) =>
              "fila " +
              (r + 1) +
              ": " +
              l.count +
              "/" +
              (r + 1) +
              (l.color >= 0 ? " " + names[l.color] : ""),
          )
          .join(" · "),
      "Suelo: " + s.floor.join("/") + ". Una unidad sobrante resta un punto.",
      "Al vaciar el suministro se colocan las filas completas en la pared; las incompletas se conservan. Bonus final: fila 2, columna 7, color completo 10.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 5,
    cells: s.walls[s.turn].map((filled, i) => ({
      key: String(i),
      label: filled ? names[((i % 5) - Math.floor(i / 5) + 5) % 5] : "·",
      symbol: filled ? glyph[((i % 5) - Math.floor(i / 5) + 5) % 5] : "·",
      owner: filled ? s.turn : undefined,
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
