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

export const words = [
  ["Ballena", "mar"],
  ["Coral", "mar"],
  ["Barco", "mar"],
  ["Ancla", "mar"],
  ["Delfín", "mar"],
  ["Bosque", "naturaleza"],
  ["Hoja", "naturaleza"],
  ["Roble", "naturaleza"],
  ["Musgo", "naturaleza"],
  ["Raíz", "naturaleza"],
  ["Cohete", "espacio"],
  ["Luna", "espacio"],
  ["Órbita", "espacio"],
  ["Cometa", "espacio"],
  ["Satélite", "espacio"],
  ["Violín", "música"],
  ["Piano", "música"],
  ["Tambor", "música"],
  ["Flauta", "música"],
  ["Arpa", "música"],
  ["Pan", "comida"],
  ["Queso", "comida"],
  ["Miel", "comida"],
  ["Sopa", "comida"],
  ["Manzana", "comida"],
  ["Llave", "casa"],
  ["Ventana", "casa"],
  ["Puerta", "casa"],
  ["Techo", "casa"],
  ["Lámpara", "casa"],
  ["Tren", "viaje"],
  ["Maleta", "viaje"],
  ["Mapa", "viaje"],
  ["Avión", "viaje"],
  ["Rueda", "viaje"],
];
export interface State extends DeductionPosition {
  board: number[];
  roles: number[];
  revealed: boolean[];
  phase: "clue" | "guess";
  team: number;
  clue: string;
  remaining: number;
  guessed: number;
  log: string[];
}
const norm = (v: string) =>
  v
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
export const initial = (_n = 4): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0, 0, 0],
  step: 0,
  message: "J1 es capitán azul; J2 capitán rojo; J3 y J4 interpretan",
  board: shuffle(words.map((_, i) => i)).slice(0, 25),
  roles: shuffle([
    ...Array(9).fill(0),
    ...Array(8).fill(1),
    ...Array(7).fill(2),
    3,
  ]),
  revealed: Array(25).fill(false),
  phase: "clue",
  team: 0,
  clue: "",
  remaining: 0,
  guessed: 0,
  log: [],
});
function validClue(s: State, text: string) {
  return (
    /^[a-záéíóúüñ]+$/i.test(text) &&
    !s.board.some((i) => norm(words[i][0]) === norm(text))
  );
}
export function actions(s: State, text = "") {
  if (s.winner !== null) return [];
  if (s.phase === "clue") {
    const clue = text.trim();
    return validClue(s, clue)
      ? [1, 2, 3].map((n) => ({
          key: "clue:" + n + ":" + clue,
          label: "Enviar pista «" + clue + "» para " + n + " palabras",
        }))
      : [];
  }
  return [
    ...s.board.flatMap((i, k) =>
      s.revealed[k]
        ? []
        : [{ key: "guess:" + k, label: "Señalar " + words[i][0] }],
    ),
    ...(s.guessed ? [{ key: "end", label: "Terminar las conjeturas" }] : []),
  ];
}
function end(s: State) {
  s.team = 1 - s.team;
  s.turn = s.team;
  s.phase = "clue";
  s.remaining = 0;
  s.guessed = 0;
  s.message = "El capitán prepara una pista";
}
export function apply(s: State, key: string) {
  const text = key.startsWith("clue") ? key.split(":").slice(2).join(":") : "";
  if (!actions(s, text).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key.startsWith("clue")) {
    const [, count, ...clue] = key.split(":");
    x.clue = clue.join(":");
    x.remaining = +count + 1;
    x.guessed = 0;
    x.turn = x.team + 2;
    x.phase = "guess";
    x.log.push("Equipo " + (x.team + 1) + " · " + x.clue + " (" + count + ")");
    x.message =
      "Interpreta «" + x.clue + "» · hasta " + x.remaining + " conjeturas";
  } else if (key === "end") end(x);
  else {
    const i = +key.split(":")[1],
      role = x.roles[i];
    x.revealed[i] = true;
    x.log.push(
      words[x.board[i]][0] +
        " → " +
        ["azul", "rojo", "neutral", "peligro"][role],
    );
    if (role === 3) x.winner = 1 - x.team;
    else {
      const counts = [0, 1].map(
        (p) => x.roles.filter((v, j) => v === p && x.revealed[j]).length,
      );
      x.scores = [counts[0], counts[1], counts[0], counts[1]];
      if (counts[0] === 9) x.winner = 0;
      else if (counts[1] === 8) x.winner = 1;
      else {
        x.remaining--;
        x.guessed++;
        if (role !== x.team || !x.remaining) end(x);
      }
    }
  }
  if (x.winner !== null)
    x.outcome =
      x.winner === 0
        ? "Gana el equipo azul · J1 + J3"
        : "Gana el equipo rojo · J2 + J4";
  return x;
}
export function automatic(s: State) {
  if (s.phase === "clue") {
    const own = s.board.flatMap((id, i) =>
        !s.revealed[i] && s.roles[i] === s.team ? [words[id][1]] : [],
      ),
      tags = [...new Set(own)].sort(
        (a, b) =>
          own.filter((v) => v === b).length - own.filter((v) => v === a).length,
      ),
      tag = tags[0] || "misterio",
      count = Math.min(3, own.filter((v) => v === tag).length) || 1;
    return apply(s, "clue:" + count + ":" + tag);
  }
  const matches = s.board.flatMap((id, i) =>
    !s.revealed[i] && norm(words[id][1]) === norm(s.clue) ? [i] : [],
  );
  return apply(
    s,
    matches.length
      ? "guess:" + matches[0]
      : s.guessed
        ? "end"
        : "guess:" + s.revealed.findIndex((v) => !v),
  );
}
export const view = (s: State) => ({
  private:
    s.phase === "clue"
      ? "Mapa privado del capitán · ◆ es la carta peligrosa"
      : "Pista pública: " + s.clue,
  cards: s.board.map((id, i): DeductionCard => {
    const show = s.revealed[i] || s.phase === "clue" || s.winner !== null;
    return {
      key: "" + i,
      label:
        words[id][0] +
        (show ? " · " + ["azul", "rojo", "neutral", "◆"][s.roles[i]] : ""),
      color: show
        ? ["#8dbbc9", "#d39a9b", "#c8bd9e", "#565466"][s.roles[i]]
        : undefined,
      excluded: s.revealed[i],
      action: s.phase === "guess" && !s.revealed[i] ? "guess:" + i : undefined,
    };
  }),
  notes: s.log.slice(-10),
  textLabel: s.phase === "clue" ? "Pista de una palabra" : undefined,
});
