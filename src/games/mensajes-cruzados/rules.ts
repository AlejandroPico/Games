import { shuffled } from "../../shared/cards";
export const dictionary = [
  { word: "LUNA", clues: ["satélite", "nocturna", "cráter", "marea"] },
  { word: "MAR", clues: ["salado", "olas", "océano", "costa"] },
  { word: "TREN", clues: ["raíles", "vagón", "estación", "locomotora"] },
  { word: "BOSQUE", clues: ["árboles", "sendero", "hojas", "silvestre"] },
  { word: "FUEGO", clues: ["calor", "llama", "brasas", "humo"] },
  { word: "LIBRO", clues: ["páginas", "novela", "lectura", "capítulo"] },
  { word: "RELOJ", clues: ["hora", "minuto", "aguja", "puntual"] },
  { word: "PAN", clues: ["harina", "horno", "miga", "masa"] },
  { word: "AVE", clues: ["pluma", "vuelo", "nido", "pico"] },
  { word: "LLAVE", clues: ["cerradura", "metal", "entrada", "abrir"] },
  { word: "FLOR", clues: ["pétalo", "jardín", "perfume", "tallo"] },
  { word: "NIEVE", clues: ["frío", "copo", "blanca", "invierno"] },
];
export type Message = {
  team: number;
  code: number[];
  clues: string[];
  reply: number[];
  intercept: number[];
};
export type State = {
  words: number[][];
  code: number[];
  clues: string[];
  reply: number[];
  phase: "encode" | "receive" | "intercept";
  turn: number;
  team: number;
  round: number;
  history: Message[];
  interceptions: number[];
  failures: number[];
  winner: number[] | null;
  ply: number;
};
const randomCode = () => shuffled([1, 2, 3, 4]).slice(0, 3);
const encoder = (round: number, team: number) =>
  team + (Math.floor(round / 2) % 2) * 2;
export function initial(): State {
  const list = shuffled(dictionary.map((_, i) => i));
  return {
    words: [list.slice(0, 4), list.slice(4, 8)],
    code: randomCode(),
    clues: [],
    reply: [],
    phase: "encode",
    turn: 0,
    team: 0,
    round: 0,
    history: [],
    interceptions: [0, 0],
    failures: [0, 0],
    winner: null,
    ply: 0,
  };
}
export const validCode = (code: number[]) =>
  code.length === 3 &&
  code.every((v) => v >= 1 && v <= 4 && Number.isInteger(v)) &&
  new Set(code).size === 3;
export function encode(s: State, clues: string[]): State {
  if (
    s.phase !== "encode" ||
    s.winner ||
    clues.length !== 3 ||
    clues.some(
      (c) =>
        !c.trim() ||
        c.length > 40 ||
        s.words[s.team].some((w) =>
          c.toLocaleLowerCase().includes(dictionary[w].word.toLowerCase()),
        ),
    )
  )
    return s;
  return {
    ...s,
    clues: clues.map((c) => c.trim()),
    phase: "receive",
    turn: (s.turn + 2) % 4,
    ply: s.ply + 1,
  };
}
export function decode(s: State, code: number[]): State {
  if (s.winner || s.phase === "encode" || !validCode(code)) return s;
  if (s.phase === "receive")
    return {
      ...s,
      reply: code,
      phase: "intercept",
      turn: encoder(s.round, 1 - s.team),
      ply: s.ply + 1,
    };
  const x = structuredClone(s),
    opponent = 1 - x.team;
  const same = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);
  if (!same(x.reply, x.code)) x.failures[x.team]++;
  if (same(code, x.code)) x.interceptions[opponent]++;
  x.history.push({
    team: x.team,
    code: x.code,
    clues: x.clues,
    reply: x.reply,
    intercept: code,
  });
  x.ply++;
  x.round++;
  if (
    x.interceptions.some((v) => v >= 2) ||
    x.failures.some((v) => v >= 2) ||
    x.round >= 8
  ) {
    const results = x.interceptions.map((v, i) => v * 2 - x.failures[i]),
      max = Math.max(...results);
    x.winner = results.flatMap((v, i) => (v === max ? [i] : []));
  } else {
    x.team = 1 - x.team;
    x.turn = encoder(x.round, x.team);
    x.phase = "encode";
    x.code = randomCode();
    x.clues = [];
    x.reply = [];
  }
  return x;
}
/** The interceptor consults only public clue/code history, never the opposing team's keywords. */
export function automatic(s: State): State {
  if (s.phase === "encode")
    return encode(
      s,
      s.code.map(
        (v) =>
          dictionary[s.words[s.team][v - 1]].clues[Math.floor(s.round / 2) % 4],
      ),
    );
  const result: number[] = [],
    available = [1, 2, 3, 4];
  for (const clue of s.clues) {
    let guess: number | undefined;
    if (s.phase === "receive")
      guess =
        s.words[s.team].findIndex((w) => dictionary[w].clues.includes(clue)) +
        1;
    else {
      for (const msg of s.history.filter((h) => h.team === s.team)) {
        const at = msg.clues.findIndex(
          (c) =>
            c === clue ||
            dictionary.some(
              (d) => d.clues.includes(c) && d.clues.includes(clue),
            ),
        );
        if (at >= 0) {
          guess = msg.code[at];
          break;
        }
      }
    }
    if (!guess || !available.includes(guess))
      guess = available[Math.floor(Math.random() * available.length)];
    result.push(guess);
    available.splice(available.indexOf(guess), 1);
  }
  return decode(s, result);
}
