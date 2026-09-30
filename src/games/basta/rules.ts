import { normalizeWord, randomItem } from "../../shared/words";
export const categories = ["Nombre", "Animal", "País", "Color"];
const answers: Record<string, string[]> = {
  Nombre:
    "Ana Alba Alberto Beatriz Bruno Blanca Carmen Carlos Clara Elena Emilio Emma Gabriel Gloria Guillermo Isabel Irene Inés María Mario Marta Nicolás Natalia Noelia Pablo Paula Pedro Rosa Raúl Roberto Sara Samuel Sonia Teresa Tomás Tina".split(
      " ",
    ),
  Animal:
    "Águila Abeja Ardilla Ballena Búho Burro Caballo Cebra Conejo Elefante Erizo Escorpión Gato Gallo Gorila Iguana Impala Insecto Mono Mariposa Mosca Nutria Narval Nécora Perro Pato Pulpo Ratón Rana Rinoceronte Sapo Serpiente Salamandra Tigre Toro Tortuga".split(
      " ",
    ),
  País: "Argentina Angola Australia Bélgica Brasil Bolivia Canadá Chile Colombia España Ecuador Estonia Ghana Grecia Guatemala India Indonesia Italia México Marruecos Mozambique Noruega Nepal Nigeria Perú Portugal Panamá Rusia Rumanía Ruanda Suecia Senegal Suiza Turquía Túnez Tailandia".split(
    " ",
  ),
  Color:
    "Azul Amarillo Añil Blanco Beige Burdeos Coral Carmesí Cian Esmeralda Ébano Escarlata Gris Granate Grafito Índigo Marfil Marrón Magenta Negro Naranja Nácar Púrpura Plateado Pardo Rojo Rosa Rubí Salmón Sepia Siena Turquesa Terracota Topacio".split(
      " ",
    ),
};
export const letters = "ABCEGIMNPRST".split("");
export type State = {
  round: number;
  letter: string;
  players: number;
  turn: number;
  forms: string[][];
  scores: number[];
  phase: "write" | "result" | "over";
  used: string[];
};
export function initial(players = 2, random = Math.random): State {
  const letter = randomItem(letters, random);
  return {
    round: 1,
    letter,
    players,
    turn: 0,
    forms: Array.from({ length: players }, () => []),
    scores: Array(players).fill(0),
    phase: "write",
    used: [letter],
  };
}
export function valid(text: string, category: string, letter: string) {
  const word = normalizeWord(text);
  return (
    word.startsWith(letter) &&
    answers[category].some((w) => normalizeWord(w) === word)
  );
}
export function choose(category: string, letter: string, random = Math.random) {
  const opts = answers[category].filter((w) =>
    normalizeWord(w).startsWith(letter),
  );
  return randomItem(opts, random) || "";
}
export function submit(s: State, values: string[]): State | null {
  if (s.phase !== "write" || values.length !== 4) return null;
  const forms = s.forms.map((f, i) =>
    i === s.turn ? values.map(normalizeWord) : f,
  );
  if (s.turn < s.players - 1) return { ...s, forms, turn: s.turn + 1 };
  const scores = s.scores.map(
    (v, p) =>
      v +
      forms[p].reduce(
        (n, w, c) =>
          n +
          (valid(w, categories[c], s.letter)
            ? forms.some((f, i) => i !== p && f[c] === w)
              ? 5
              : 10
            : 0),
        0,
      ),
  );
  return { ...s, forms, scores, phase: s.round === 5 ? "over" : "result" };
}
export function nextRound(s: State, random = Math.random): State | null {
  if (s.phase !== "result") return null;
  const letter = randomItem(
    letters.filter((l) => !s.used.includes(l)),
    random,
  );
  return {
    ...s,
    round: s.round + 1,
    letter,
    turn: 0,
    forms: Array.from({ length: s.players }, () => []),
    phase: "write",
    used: [...s.used, letter],
  };
}
export const acceptedWords = (category: string) => answers[category];
