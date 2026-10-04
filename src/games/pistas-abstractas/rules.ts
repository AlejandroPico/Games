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

export interface Picture {
  animal: number;
  scene: number;
  mood: number;
}
export const animals = ["Zorro", "Búho", "Ciervo", "Pez", "Lobo", "Gato"],
  scenes = ["bosque", "mar", "montaña", "ciudad"],
  moods = ["sereno", "misterioso", "luminoso"];
export const pictures: Picture[] = Array.from({ length: 72 }, (_, i) => ({
  animal: i % 6,
  scene: Math.floor(i / 6) % 4,
  mood: Math.floor(i / 24) % 3,
}));
export interface State extends DeductionPosition {
  hands: number[][];
  deck: number[];
  narrator: number;
  round: number;
  phase: "clue" | "submit" | "vote";
  clue: string;
  chosen: number;
  submitted: number[];
  table: { card: number; owner: number }[];
  votes: number[];
}
export function initial(n = 3): State {
  const deck = shuffle(pictures.map((_, i) => i)),
    hands = Array.from({ length: n }, () => deck.splice(0, 5));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "El narrador elige una ilustración y escribe una pista",
    hands,
    deck,
    narrator: 0,
    round: 1,
    phase: "clue",
    clue: "",
    chosen: -1,
    submitted: Array(n).fill(-1),
    table: [],
    votes: Array(n).fill(-1),
  };
}
const name = (i: number) =>
  animals[pictures[i].animal] +
  " · " +
  scenes[pictures[i].scene] +
  " · " +
  moods[pictures[i].mood];
export function actions(s: State, text = "") {
  if (s.winner !== null) return [];
  if (s.phase === "clue")
    return text.trim().length >= 2
      ? s.hands[s.turn].map((i) => ({
          key: "clue:" + i + ":" + text.trim(),
          label: "Dar pista para " + name(i),
        }))
      : [];
  if (s.phase === "submit")
    return s.hands[s.turn].map((i) => ({
      key: "submit:" + i,
      label: "Aportar " + name(i),
    }));
  return s.table.flatMap((v, i) =>
    v.owner !== s.turn
      ? [
          {
            key: "vote:" + i,
            label: "Votar ilustración " + (i + 1) + " · " + name(v.card),
          },
        ]
      : [],
  );
}
export function apply(s: State, key: string) {
  const clue = key.startsWith("clue") ? key.split(":").slice(2).join(":") : "";
  if (!actions(s, clue).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  const [type, num, ...words] = key.split(":");
  if (type === "clue") {
    x.chosen = +num;
    x.clue = words.join(":");
    x.submitted[x.narrator] = +num;
    x.phase = "submit";
    x.turn = (x.narrator + 1) % x.scores.length;
    x.message = "Aporta una ilustración que encaje con «" + x.clue + "»";
  } else if (type === "submit") {
    x.submitted[x.turn] = +num;
    x.turn = (x.turn + 1) % x.scores.length;
    if (x.turn === x.narrator) {
      x.table = shuffle(x.submitted.map((card, owner) => ({ card, owner })));
      x.phase = "vote";
      x.turn = (x.narrator + 1) % x.scores.length;
      x.message = "Encuentra la ilustración del narrador · «" + x.clue + "»";
    }
  } else {
    x.votes[x.turn] = +num;
    x.turn = (x.turn + 1) % x.scores.length;
    if (x.turn === x.narrator) {
      const correct = x.votes.filter(
        (v) => v >= 0 && x.table[v].owner === x.narrator,
      ).length;
      if (correct === 0 || correct === x.scores.length - 1)
        x.scores = x.scores.map((v, p) => v + (p === x.narrator ? 0 : 2));
      else {
        x.scores[x.narrator] += 3;
        x.votes.forEach((v, p) => {
          if (v >= 0 && x.table[v].owner === x.narrator) x.scores[p] += 3;
        });
      }
      x.votes.forEach((v) => {
        if (v >= 0 && x.table[v].owner !== x.narrator)
          x.scores[x.table[v].owner]++;
      });
      x.hands = x.hands.map((h, p) => {
        const a = h.filter((v) => v !== x.submitted[p]);
        if (x.deck.length) a.push(x.deck.pop()!);
        return a;
      });
      x.round++;
      x.narrator = (x.narrator + 1) % x.scores.length;
      x.turn = x.narrator;
      x.phase = "clue";
      x.message = "Ronda " + x.round + " · elige otra pista";
      x.submitted.fill(-1);
      x.votes.fill(-1);
      if (x.round > x.scores.length * 2 || x.hands.some((h) => !h.length)) {
        x.winner = best(x.scores);
        x.message = "Final de la galería";
      }
    }
  }
  return x;
}
function similarity(id: number, clue: string) {
  const p = pictures[id],
    v = clue.toLowerCase();
  return (
    (v.includes(animals[p.animal].toLowerCase()) ? 2 : 0) +
    (v.includes(scenes[p.scene]) ? 2 : 0) +
    (v.includes(moods[p.mood]) ? 1 : 0)
  );
}
export function automatic(s: State) {
  if (s.phase === "clue") {
    const card = s.hands[s.turn][0],
      p = pictures[card];
    return apply(
      s,
      "clue:" + card + ":" + scenes[p.scene] + " " + moods[p.mood],
    );
  }
  if (s.phase === "submit") {
    const hand = [...s.hands[s.turn]].sort(
      (a, b) => similarity(b, s.clue) - similarity(a, s.clue),
    );
    return apply(s, "submit:" + hand[0]);
  }
  const a = s.table
    .flatMap((v, i) => (v.owner !== s.turn ? [i] : []))
    .sort(
      (a, b) =>
        similarity(s.table[b].card, s.clue) -
        similarity(s.table[a].card, s.clue),
    );
  return apply(s, "vote:" + a[0]);
}
export const view = (s: State) => ({
  private:
    s.phase === "clue"
      ? "Eres el narrador; crea una pista que no sea demasiado evidente"
      : "Pista pública: " + s.clue,
  cards: (s.phase === "vote"
    ? s.table.map((v) => v.card)
    : s.hands[s.turn]
  ).map(
    (id, i): DeductionCard => ({
      key: "" + i,
      label:
        s.phase === "vote"
          ? "Ilustración " + (i + 1) + " · " + name(id)
          : name(id),
      icon: "scene:" + id,
      action:
        s.phase === "submit"
          ? "submit:" + id
          : s.phase === "vote" && s.table[i].owner !== s.turn
            ? "vote:" + i
            : undefined,
    }),
  ),
  notes: [
    "Ronda " + s.round + " · narrador J" + (s.narrator + 1),
    "Cada persona debe elegir una carta ajena en la votación. La IA interpreta los animales, paisajes y estados del conjunto; no entiende todas las metáforas libres.",
  ],
  textLabel: s.phase === "clue" ? "Escribe tu pista" : undefined,
});
