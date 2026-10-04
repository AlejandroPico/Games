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

export const ingredients = [
  "Luna",
  "Raíz",
  "Cristal",
  "Pluma",
  "Musgo",
  "Brasa",
];
export const formula = (v: number) =>
  Array.from({ length: 3 }, (_, k) => (v & (1 << k) ? "+" : "−")).join("");
export function mix(a: number, b: number) {
  return Array.from({ length: 3 }, (_, k) =>
    (a & (1 << k)) === (b & (1 << k)) ? (a & (1 << k) ? "+" : "−") : "0",
  ).join("");
}
export interface State extends DeductionPosition {
  solution: number[];
  experiments: { a: number; b: number; result: string }[];
  wrong: { i: number; v: number }[];
  known: (number | null)[];
  limit: number;
}
export const initial = (n = 2): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  step: 0,
  message: "Mezcla dos ingredientes y deduce sus tres signos",
  solution: shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 6),
  experiments: [],
  wrong: [],
  known: Array(6).fill(null),
  limit: n * 24,
});
export function actions(s: State, _text = "") {
  if (s.winner !== null) return [];
  const a: { key: string; label: string }[] = [];
  for (let i = 0; i < 6; i++)
    for (let j = i + 1; j < 6; j++)
      if (!s.experiments.some((e) => e.a === i && e.b === j))
        a.push({
          key: "mix:" + i + ":" + j,
          label: "Mezclar " + ingredients[i] + " + " + ingredients[j],
        });
  for (let i = 0; i < 6; i++)
    if (s.known[i] === null)
      for (let v = 0; v < 8; v++)
        if (!s.wrong.some((e) => e.i === i && e.v === v))
          a.push({
            key: "claim:" + i + ":" + v,
            label: ingredients[i] + " tiene fórmula " + formula(v),
          });
  return a;
}
export function candidates(s: State) {
  const out: number[][] = [];
  function fill(a: number[]) {
    const i = a.length;
    if (i === 6) {
      out.push(a);
      return;
    }
    for (let v = 0; v < 8; v++) {
      if (
        a.includes(v) ||
        (s.known[i] !== null && s.known[i] !== v) ||
        s.wrong.some((e) => e.i === i && e.v === v)
      )
        continue;
      if (s.experiments.some((e) => e.b === i && mix(a[e.a], v) !== e.result))
        continue;
      fill([...a, v]);
    }
  }
  fill([]);
  return out;
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s),
    [type, i, v] = key.split(":"),
    a = +i,
    b = +v;
  x.step++;
  if (type === "mix") {
    const result = mix(x.solution[a], x.solution[b]);
    x.experiments.push({ a, b, result });
    x.message = ingredients[a] + " + " + ingredients[b] + " → " + result;
  } else if (x.solution[a] === b) {
    x.known[a] = b;
    x.scores[x.turn] += 2;
    x.message = "Fórmula demostrada: +2 puntos";
  } else {
    x.wrong.push({ i: a, v: b });
    x.scores[x.turn]--;
    x.message = "Fórmula refutada: −1 punto";
  }
  x.turn = (x.turn + 1) % x.scores.length;
  if (x.known.every((v) => v !== null) || x.step >= x.limit)
    x.winner = best(x.scores);
  return x;
}
export function automatic(s: State) {
  const c = candidates(s);
  for (let i = 0; i < 6; i++)
    if (s.known[i] === null && c.length && c.every((a) => a[i] === c[0][i]))
      return apply(s, "claim:" + i + ":" + c[0][i]);
  const a = actions(s);
  const experiment = a.find((a) => a.key.startsWith("mix"));
  if (experiment) return apply(s, experiment.key);
  return apply(
    s,
    c.length
      ? "claim:" +
          s.known.findIndex((v) => v === null) +
          ":" +
          c[0][s.known.findIndex((v) => v === null)]
      : a[0]?.key || "",
  );
}
export const view = (s: State) => ({
  cards: ingredients.map(
    (v, i): DeductionCard => ({
      key: "" + i,
      label: v + (s.known[i] !== null ? " · " + formula(s.known[i]!) : " · ?"),
      icon: ["☾", "❦", "◇", "♧", "❧", "♨"][i],
    }),
  ),
  notes: [
    ...s.experiments.map(
      (e) => ingredients[e.a] + " + " + ingredients[e.b] + " = " + e.result,
    ),
    ...s.wrong.map((e) => ingredients[e.i] + " NO es " + formula(e.v)),
    s.message,
    "Signos: rojo, verde y azul. 0 significa que los signos difieren.",
  ],
});
