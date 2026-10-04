import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface Word {
  answer: string;
  clue: string;
  cells: number[];
}
export interface State extends LogicPosition {
  letters: string[];
  words: Word[];
}
const sets = [
  {
    vertical: "PLANETA",
    clue: "Mundo que orbita una estrella",
    across: [
      ["PATO", "Ave de pico ancho"],
      ["LANA", "Fibra de las ovejas"],
      ["NUBE", "Masa de gotas en el cielo"],
      ["AGUA", "Líquido que bebemos"],
    ],
  },
  {
    vertical: "CAMINOS",
    clue: "Rutas por las que se transita",
    across: [
      ["CASA", "Edificio para vivir"],
      ["MESA", "Mueble de un tablero y patas"],
      ["NIDO", "Refugio que construyen las aves"],
      ["SOL", "Estrella de nuestro sistema"],
    ],
  },
  {
    vertical: "BOSQUES",
    clue: "Conjuntos de árboles",
    across: [
      ["BARCO", "Vehículo que navega"],
      ["SAL", "Condimento de cristales blancos"],
      ["UVA", "Fruta de la vid"],
      ["SOPA", "Plato líquido servido caliente"],
    ],
  },
];
export function initial(size: number): State {
  const n = size === 11 ? 11 : 9,
    data = pick(sets),
    x = 4,
    offset = Math.floor((n - 7) / 2),
    letters = Array(n * n).fill("#"),
    words: Word[] = [
      {
        answer: data.vertical,
        clue: data.clue,
        cells: Array.from({ length: 7 }, (_, i) => (offset + i) * n + x),
      },
    ];
  data.across.forEach(([answer, clue], i) => {
    const letter = data.vertical[i * 2],
      cross = answer.indexOf(letter),
      start = x - Math.max(0, cross);
    words.push({
      answer,
      clue,
      cells: Array.from(
        { length: answer.length },
        (_, k) => (offset + i * 2) * n + start + k,
      ),
    });
  });
  for (const w of words) for (const i of w.cells) letters[i] = "";
  return {
    size: n,
    letters,
    words,
    turn: 0,
    winner: null,
    step: 0,
    message: "Resuelve las definiciones y completa las letras compartidas",
  };
}
export function valid(s: State): boolean {
  return s.words.every(
    (w) => w.cells.map((i) => s.letters[i]).join("") === w.answer,
  );
}
export function apply(s: State, key: string): State {
  const [raw, letter] = key.split(":"),
    i = Number(raw);
  if (
    s.winner !== null ||
    !Number.isInteger(i) ||
    s.letters[i] === undefined ||
    s.letters[i] === "#" ||
    !/^([A-ZÑ]|_)$/.test(letter || "")
  )
    return s;
  const t = copy(s);
  t.letters[i] = letter === "_" ? "" : letter;
  t.step++;
  if (valid(t)) t.winner = 0;
  return t;
}
export function automatic(s: State): State {
  for (const w of s.words)
    for (let j = 0; j < w.cells.length; j++)
      if (s.letters[w.cells[j]] !== w.answer[j])
        return apply(s, w.cells[j] + ":" + w.answer[j]);
  return { ...s, winner: 0 };
}
export function view(s: State, tool: string): LogicView {
  return {
    columns: s.size,
    tools: [
      ...Array.from("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ").map((key) => ({
        key,
        label: key,
      })),
      { key: "_", label: "Borrar" },
    ],
    cells: s.letters.map((v, i) => ({
      key: i,
      label:
        "Fila " +
        (Math.floor(i / s.size) + 1) +
        ", columna " +
        ((i % s.size) + 1),
      text: v === "#" ? "" : v,
      kind: v === "#" ? "wall" : "",
      top:
        s.words.findIndex((w) => w.cells[0] === i) >= 0
          ? String(s.words.findIndex((w) => w.cells[0] === i) + 1)
          : undefined,
      action:
        v !== "#" ? i + ":" + (/^[A-ZÑ_]$/.test(tool) ? tool : "A") : undefined,
    })),
    notes: s.words
      .map(
        (w, i) =>
          i +
          1 +
          ". " +
          (i === 0 ? "Vertical" : "Horizontal") +
          " · " +
          w.clue +
          " (" +
          w.answer.length +
          " letras).",
      )
      .concat(
        "Selecciona letra y casilla; el teclado cambia la letra. Tres crucigramas artesanales rotan aleatoriamente. La IA usa un vocabulario de estas definiciones, no pretende entender cualquier pista nueva.",
      ),
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
