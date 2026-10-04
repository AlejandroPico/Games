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

export const locations = [
  { name: "Biblioteca", tags: [0, 1, 0, 0, 0] },
  { name: "Playa", tags: [1, 0, 1, 0, 0] },
  { name: "Avión", tags: [0, 0, 0, 1, 1] },
  { name: "Hospital", tags: [0, 1, 0, 1, 0] },
  { name: "Restaurante", tags: [0, 0, 0, 0, 1] },
  { name: "Estación", tags: [0, 0, 0, 1, 0] },
  { name: "Piscina", tags: [1, 0, 0, 0, 1] },
  { name: "Museo", tags: [0, 1, 0, 0, 1] },
];
export const questions = [
  "¿Hay agua?",
  "¿Se habla en voz baja?",
  "¿Estamos al aire libre?",
  "¿Hay uniformes?",
  "¿Hace falta una entrada o reserva?",
];
export interface State extends DeductionPosition {
  spy: number;
  location: number;
  phase: "question" | "answer" | "vote";
  question: number;
  asker: number;
  cycles: number;
  answers: { actor: number; q: number; yes: boolean }[];
  votes: number[];
}
export const initial = (n = 4): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  step: 0,
  message: "Pregunta sin decir la localización",
  spy: Math.floor(Math.random() * n),
  location: Math.floor(Math.random() * locations.length),
  phase: "question",
  question: 0,
  asker: 0,
  cycles: 0,
  answers: [],
  votes: Array(n).fill(-1),
});
export function actions(s: State, _text = "") {
  if (s.winner !== null) return [];
  if (s.phase === "answer")
    return [
      { key: "yes", label: "Responder sí" },
      { key: "no", label: "Responder no" },
    ];
  if (s.phase === "vote")
    return s.scores.flatMap((_, p) =>
      p !== s.turn ? [{ key: "vote:" + p, label: "Votar a J" + (p + 1) }] : [],
    );
  return [
    ...questions.map((v, i) => ({ key: "ask:" + i, label: v })),
    ...(s.turn === s.spy
      ? locations.map((v, i) => ({
          key: "guess:" + i,
          label: "Revelarme como intruso y adivinar " + v.name,
        }))
      : []),
  ];
}
function finish(x: State, caught: boolean) {
  if (caught) {
    x.scores = x.scores.map((_, i) => (i === x.spy ? 0 : 1));
    x.winner = (x.spy + 1) % x.scores.length;
  } else {
    x.scores[x.spy] = 1;
    x.winner = x.spy;
  }
  x.outcome = caught ? "Gana el grupo" : "Gana el intruso J" + (x.spy + 1);
  x.message =
    (caught ? "Gana el grupo" : "Gana el intruso") +
    " · era J" +
    (x.spy + 1) +
    " en " +
    locations[x.location].name;
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key.startsWith("guess")) {
    finish(x, +key.split(":")[1] !== x.location);
    return x;
  }
  if (key.startsWith("ask")) {
    x.question = +key.split(":")[1];
    x.asker = x.turn;
    x.turn = (x.turn + 1) % x.scores.length;
    x.phase = "answer";
    x.message = questions[x.question];
  } else if (key === "yes" || key === "no") {
    x.answers.push({ actor: x.turn, q: x.question, yes: key === "yes" });
    x.cycles++;
    x.turn = (x.asker + 1) % x.scores.length;
    if (x.cycles >= x.scores.length * 2) {
      x.turn = 0;
      x.phase = "vote";
      x.message = "Vota en privado quién parece el intruso";
    } else {
      x.phase = "question";
      x.message = "Pregunta al siguiente participante";
    }
  } else {
    x.votes[x.turn] = +key.split(":")[1];
    x.turn++;
    if (x.turn === x.scores.length) {
      x.turn = 0;
      const counts = x.scores.map(
          (_, i) => x.votes.filter((v) => v === i).length,
        ),
        max = Math.max(...counts),
        accused = counts.indexOf(max);
      finish(
        x,
        counts.filter((v) => v === max).length === 1 && accused === x.spy,
      );
    }
  }
  return x;
}
export function possible(s: State, exclude: number) {
  return locations
    .map((_, i) => i)
    .filter((i) =>
      s.answers
        .filter((a) => a.actor !== exclude)
        .every((a) => !!locations[i].tags[a.q] === a.yes),
    );
}
export function automatic(s: State) {
  if (s.phase === "answer") {
    if (s.turn !== s.spy)
      return apply(s, locations[s.location].tags[s.question] ? "yes" : "no");
    const candidates = possible(s, s.turn);
    return apply(
      s,
      candidates.length
        ? locations[candidates[0]].tags[s.question]
          ? "yes"
          : "no"
        : Math.random() < 0.5
          ? "yes"
          : "no",
    );
  }
  if (s.phase === "vote") {
    let suspect = (s.turn + 1) % s.scores.length,
      best = -1;
    for (let p = 0; p < s.scores.length; p++)
      if (p !== s.turn) {
        const count = possible(s, p).length;
        if (count > best) {
          best = count;
          suspect = p;
        }
      }
    return apply(s, "vote:" + suspect);
  }
  if (s.turn === s.spy) {
    const c = possible(s, s.turn);
    if (c.length === 1) return apply(s, "guess:" + c[0]);
  }
  return apply(s, "ask:" + (s.cycles % questions.length));
}
export const view = (s: State) => ({
  private:
    s.winner !== null
      ? s.message
      : s.turn === s.spy
        ? "Eres EL INTRUSO. No conoces la localización."
        : "Localización secreta: " + locations[s.location].name,
  cards: s.scores.map(
    (_, i): DeductionCard => ({ key: "" + i, label: "J" + (i + 1), icon: "◈" }),
  ),
  notes: [
    ...s.answers.map(
      (a) =>
        "J" +
        (a.actor + 1) +
        " · " +
        questions[a.q] +
        " " +
        (a.yes ? "Sí" : "No"),
    ),
    s.winner !== null
      ? "Votos: " +
        s.votes.map((p, i) => "J" + (i + 1) + "→J" + (p + 1)).join(", ")
      : "",
  ],
});
