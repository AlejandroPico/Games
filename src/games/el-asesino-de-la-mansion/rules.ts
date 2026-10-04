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

export const suspects = ["Ada", "Bruno", "Celia", "Dario", "Elena", "Fabio"],
  weapons = ["Llave", "Cuerda", "Bastón", "Veneno", "Candelabro", "Cuchillo"],
  rooms = ["Biblioteca", "Cocina", "Salón", "Jardín", "Despacho", "Bodega"];
export const cards = [...suspects, ...weapons, ...rooms];
export interface State extends DeductionPosition {
  solution: number[];
  hands: number[][];
  notes: number[][];
  eliminated: boolean[];
  phase: "investigate" | "refute" | "decision";
  suggestion: number[];
  questioner: number;
  refuter: number;
  log: string[];
  requests: string[][];
}
export function initial(n = 3): State {
  const solution = [
      Math.floor(Math.random() * 6),
      6 + Math.floor(Math.random() * 6),
      12 + Math.floor(Math.random() * 6),
    ],
    deck = shuffle(cards.map((_, i) => i).filter((i) => !solution.includes(i))),
    hands = Array.from({ length: n }, () => [] as number[]);
  deck.forEach((v, i) => hands[i % n].push(v));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Sugiere sospechoso, objeto y habitación",
    solution,
    hands,
    notes: hands.map((a) => [...a]),
    eliminated: Array(n).fill(false),
    phase: "investigate",
    suggestion: [],
    questioner: 0,
    refuter: 0,
    log: [],
    requests: Array.from({ length: n }, () => []),
  };
}
export const remaining = (s: State, p: number) =>
  [0, 6, 12].map((base) =>
    Array.from({ length: 6 }, (_, i) => base + i).filter(
      (i) => !s.notes[p].includes(i),
    ),
  );
function advance(x: State) {
  if (x.eliminated.every(Boolean)) {
    x.winner = -1;
    return;
  }
  do {
    x.turn = (x.turn + 1) % x.hands.length;
  } while (x.eliminated[x.turn]);
  x.phase = "investigate";
  x.message = "Sugiere otra combinación o acusa";
  if (x.step >= 180) {
    x.winner = -1;
    x.message = "Caso sin resolver: límite de investigación";
  }
}
export function actions(s: State, _text = "") {
  if (s.winner !== null) return [];
  if (s.phase === "refute")
    return s.hands[s.turn]
      .filter((i) => s.suggestion.includes(i))
      .map((i) => ({
        key: "show:" + i,
        label: "Mostrar en privado: " + cards[i],
      }));
  const a: { key: string; label: string }[] = [];
  if (s.phase === "decision")
    a.push({ key: "end", label: "Terminar el turno sin acusar" });
  const groups = remaining(s, s.turn);
  for (const i of groups[0])
    for (const j of groups[1])
      for (const k of groups[2]) {
        const triple = i + "," + j + "," + k;
        if (s.phase === "investigate")
          a.push({
            key: "suggest:" + triple,
            label: "Investigar: " + [i, j, k].map((i) => cards[i]).join(" / "),
          });
        a.push({
          key: "accuse:" + triple,
          label: "Acusar: " + [i, j, k].map((i) => cards[i]).join(" / "),
        });
      }
  return a;
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  const [type, payload] = key.split(":");
  if (type === "end") {
    advance(x);
    return x;
  }
  if (type === "show") {
    const card = +payload;
    if (!x.notes[x.questioner].includes(card)) x.notes[x.questioner].push(card);
    x.log.push(
      "J" + (x.turn + 1) + " mostró una carta a J" + (x.questioner + 1),
    );
    x.turn = x.questioner;
    x.phase = "decision";
    x.message = "Anota la carta recibida y decide si acusar";
    return x;
  }
  const triple = payload.split(",").map(Number);
  if (type === "accuse") {
    if (triple.every((v, i) => v === x.solution[i])) {
      x.winner = x.turn;
      x.scores[x.turn] = 1;
      x.message = "Caso resuelto: " + triple.map((i) => cards[i]).join(" / ");
    } else {
      x.eliminated[x.turn] = true;
      x.message = "Acusación falsa: ya no puedes ganar, pero sigues refutando";
      advance(x);
    }
    return x;
  }
  x.suggestion = triple;
  x.questioner = x.turn;
  x.requests[x.turn].push(payload);
  x.log.push(
    "J" + (x.turn + 1) + ": " + triple.map((i) => cards[i]).join(" / "),
  );
  let found = -1;
  for (let offset = 1; offset < x.hands.length; offset++) {
    const p = (x.turn + offset) % x.hands.length;
    if (x.hands[p].some((i) => triple.includes(i))) {
      found = p;
      break;
    }
  }
  if (found >= 0) {
    x.turn = found;
    x.phase = "refute";
    x.message = "Refuta con una de tus cartas de la sugerencia";
  } else {
    x.phase = "decision";
    x.message = "Nadie pudo refutar la sugerencia";
    x.log.push("Nadie refutó");
    for (const i of triple)
      if (!x.hands[x.turn].includes(i)) {
        /* no card shown; retain inference in the visible log */
      }
  }
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  if (s.phase === "refute") return apply(s, a[0]?.key || "");
  const groups = remaining(s, s.turn);
  if (groups.every((g) => g.length === 1))
    return apply(s, "accuse:" + groups.flat().join(","));
  if (s.phase === "decision") {
    const last = s.log.at(-1);
    if (last === "Nadie refutó")
      return apply(s, "accuse:" + s.suggestion.join(","));
    return apply(s, "end");
  }
  const suggestions = a.filter(
    (a) =>
      a.key.startsWith("suggest") &&
      !s.requests[s.turn].includes(a.key.split(":")[1]),
  );
  return apply(
    s,
    (suggestions.length
      ? suggestions[Math.floor(Math.random() * suggestions.length)]
      : a.find((a) => a.key.startsWith("accuse"))
    )?.key || "",
  );
}
export const view = (s: State) => ({
  private: "Tus cartas: " + s.hands[s.turn].map((i) => cards[i]).join(", "),
  cards: cards.map(
    (v, i): DeductionCard => ({
      key: "" + i,
      label: v,
      excluded: s.notes[s.turn].includes(i),
    }),
  ),
  notes: [
    ...s.log.slice(-14),
    "Cartas descartadas en tu cuaderno: " +
      s.notes[s.turn].map((i) => cards[i]).join(", "),
    s.winner !== null
      ? "Solución: " + s.solution.map((i) => cards[i]).join(" / ")
      : "",
  ],
});
