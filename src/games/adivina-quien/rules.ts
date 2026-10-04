import type {
  DeductionPosition,
  DeductionCard,
} from "../../shared/DeductionTable";
const shuffle = <T>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export const people = Array.from({ length: 24 }, (_, i) => ({
  name: [
    "Ada",
    "Bruno",
    "Celia",
    "Dario",
    "Elena",
    "Fabio",
    "Gala",
    "Hugo",
    "Iria",
    "Joel",
    "Kira",
    "Leo",
    "Mara",
    "Nico",
    "Olga",
    "Pau",
    "Rita",
    "Saul",
    "Tina",
    "Uri",
    "Vera",
    "Waldo",
    "Xenia",
    "Yago",
  ][i],
  hair: i % 4,
  glasses: Math.floor(i / 4) % 2,
  hat: Math.floor(i / 8),
  beard: i % 3 === 0 ? 1 : 0,
}));
export const traits = [
  { key: "hair", values: ["negro", "rubio", "castaño", "rojo"] },
  { key: "glasses", values: ["sin gafas", "con gafas"] },
  { key: "hat", values: ["sin sombrero", "sombrero azul", "sombrero verde"] },
  { key: "beard", values: ["sin barba", "con barba"] },
] as const;
export interface State extends DeductionPosition {
  secrets: number[];
  candidates: number[][];
  notes: string[][];
  asked: string[][];
}
export const initial = (_n = 2): State => ({
  turn: 0,
  winner: null,
  scores: [24, 24],
  step: 0,
  message: "Pregunta por un rasgo o identifica al personaje rival",
  secrets: [Math.floor(Math.random() * 24), Math.floor(Math.random() * 24)],
  candidates: [people.map((_, i) => i), people.map((_, i) => i)],
  notes: [[], []],
  asked: [[], []],
});
export function actions(s: State, _text = "") {
  if (s.winner !== null) return [];
  return [
    ...traits.flatMap((t) =>
      t.values.flatMap((v, i) =>
        s.asked[s.turn].includes(t.key + ":" + i)
          ? []
          : [{ key: "ask:" + t.key + ":" + i, label: "¿Tiene " + v + "?" }],
      ),
    ),
    ...s.candidates[s.turn].map((i) => ({
      key: "guess:" + i,
      label: "Adivinar: " + people[i].name,
    })),
  ];
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s),
    p = x.turn;
  x.step++;
  if (key.startsWith("guess")) {
    const i = +key.split(":")[1];
    x.winner = i === x.secrets[1 - p] ? p : 1 - p;
    x.message =
      i === x.secrets[1 - p]
        ? "Identificación correcta"
        : "Identificación equivocada";
    x.notes[p].push("El personaje rival era " + people[x.secrets[1 - p]].name);
  } else {
    const [, trait, value] = key.split(":"),
      t = traits.find((t) => t.key === trait)!,
      v = +value,
      answer = people[x.secrets[1 - p]][t.key] === v;
    x.asked[p].push(trait + ":" + v);
    x.candidates[p] = x.candidates[p].filter(
      (i) => (people[i][t.key] === v) === answer,
    );
    x.notes[p].push(
      t.values[v] +
        ": " +
        (answer ? "sí" : "no") +
        " · quedan " +
        x.candidates[p].length,
    );
    x.turn = 1 - p;
    x.message = "Filtra personajes mediante preguntas binarias";
  }
  x.scores = x.candidates.map((a) => a.length);
  return x;
}
export function automatic(s: State) {
  const c = s.candidates[s.turn];
  if (c.length === 1) return apply(s, "guess:" + c[0]);
  const questions = actions(s).filter((a) => a.key.startsWith("ask"));
  let choice = questions[0],
    v = Infinity;
  for (const a of questions) {
    const [, trait, value] = a.key.split(":"),
      t = traits.find((t) => t.key === trait)!,
      yes = c.filter((i) => people[i][t.key] === +value).length,
      d = Math.abs(c.length - 2 * yes);
    if (d < v) {
      v = d;
      choice = a;
    }
  }
  return choice ? apply(s, choice.key) : apply(s, "guess:" + c[0]);
}
export const view = (s: State) => ({
  private: "Tu personaje secreto: " + people[s.secrets[s.turn]].name,
  cards: people.map(
    (p, i): DeductionCard => ({
      key: "" + i,
      label: p.name,
      excluded: !s.candidates[s.turn].includes(i),
      action: s.candidates[s.turn].includes(i) ? "guess:" + i : undefined,
      icon: "person:" + p.hair + ":" + p.glasses + ":" + p.hat + ":" + p.beard,
    }),
  ),
  notes: s.notes[s.turn],
});
