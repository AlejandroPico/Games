import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: string[][];
  deck: string[];
  alive: boolean[];
  defuses: number[];
  phase: "play" | "insert";
  pending: number;
  peek: string[][];
  journal: string[];
}
const labels: Record<string, string> = {
  skip: "Salto",
  peek: "Visor",
  shuffle: "Mezclar",
  attack: "Ataque",
  bomb: "Explosión",
  safe: "Carta segura",
};
export function initial(n: number): State {
  const deck = shuffle(
      Array.from(
        { length: 40 },
        (_, i) => ["safe", "skip", "peek", "shuffle", "attack"][i % 5],
      ),
    ),
    hands = Array.from({ length: n }, () => deck.splice(0, 4));
  deck.push(...Array(n - 1).fill("bomb"));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Juega una carta o roba",
    hands,
    deck: shuffle(deck),
    alive: Array(n).fill(true),
    defuses: Array(n).fill(1),
    phase: "play",
    pending: 1,
    peek: Array.from({ length: n }, () => []),
    journal: [],
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.phase === "insert"
    ? Array.from({ length: s.deck.length + 1 }, (_, i) => ({
        key: "insert:" + i,
        label: "Reinsertar explosión a profundidad " + i,
      }))
    : [
        { key: "draw", label: "Robar y terminar" },
        ...s.hands[s.turn].flatMap((c, i) =>
          c !== "safe" ? [{ key: "card:" + i, label: labels[c] }] : [],
        ),
      ];
}
function next(t: State, draws = 1) {
  const live = t.alive.flatMap((v, i) => (v ? [i] : []));
  t.scores = t.alive.map((v) => (v ? 1 : 0));
  if (live.length === 1) {
    t.winner = live[0];
    return;
  }
  for (let k = 1; k <= t.alive.length; k++)
    if (t.alive[(t.turn + k) % t.alive.length]) {
      t.turn = (t.turn + k) % t.alive.length;
      break;
    }
  t.pending = draws;
  t.phase = "play";
  t.message = "Juega una carta o roba";
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  t.step++;
  if (key.startsWith("insert:")) {
    t.deck.splice(Number(key.split(":")[1]), 0, "bomb");
    t.peek = t.peek.map(() => []);
    t.phase = "play";
    t.pending--;
    if (t.pending <= 0) next(t);
  } else if (key === "draw") {
    t.peek = t.peek.map(() => []);
    const c = t.deck.shift();
    if (!c) {
      t.winner = champion(t.alive.map((v, i) => (v ? t.hands[i].length : -1)));
      t.outcome = "Fin de mazo: gana la mayor mano superviviente";
    } else if (c === "bomb") {
      if (t.defuses[p]) {
        t.defuses[p]--;
        t.phase = "insert";
        t.message = "Desactivada: decide dónde devolver la explosión";
      } else {
        t.alive[p] = false;
        t.journal.push("J" + (p + 1) + " explotó");
        next(t);
      }
    } else {
      t.hands[p].push(c);
      t.pending--;
      if (t.pending <= 0) next(t);
    }
  } else {
    const i = Number(key.split(":")[1]),
      c = t.hands[p].splice(i, 1)[0];
    if (c === "skip") {
      t.pending--;
      if (t.pending <= 0) next(t);
    }
    if (c === "peek") t.peek[p] = t.deck.slice(0, 3);
    if (c === "shuffle") {
      t.deck = shuffle(t.deck);
      t.peek = t.peek.map(() => []);
    }
    if (c === "attack") next(t, t.pending + 1);
  }
  return t;
}
export function automatic(s: State): State {
  if (s.phase === "insert")
    return apply(s, "insert:" + Math.min(2, s.deck.length));
  const p = s.turn,
    bomb = s.peek[p][0] === "bomb",
    cards = actions(s).filter((a) => a.key.startsWith("card:"));
  if (bomb) {
    const evade = cards.find((a) =>
      ["skip", "attack", "shuffle"].includes(
        s.hands[p][Number(a.key.split(":")[1])],
      ),
    );
    if (evade) return apply(s, evade.key);
  }
  const attack = cards.find(
    (a) => s.hands[p][Number(a.key.split(":")[1])] === "attack",
  );
  if (attack && s.hands[p].length > 3) return apply(s, attack.key);
  return apply(s, "draw");
}
export function view(s: State) {
  return {
    private:
      "Desactivadores: " +
      s.defuses[s.turn] +
      (s.peek[s.turn].length
        ? " · Visor: " + s.peek[s.turn].map((c) => labels[c]).join(", ")
        : ""),
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: labels[c],
      icon: c === "attack" ? "⚡" : c === "peek" ? "◉" : "▤",
      action: c !== "safe" && s.phase === "play" ? "card:" + i : undefined,
    })),
    notes: [
      "Mazo: " + s.deck.length + " · robos obligados " + s.pending,
      ...s.journal.slice(-4),
      "Cada persona empieza con un desactivador. Salto evita un robo; Ataque pasa tus robos pendientes más uno al siguiente. El Visor solo lo ve quien lo usa.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.alive.length,
    cells: s.alive.map((v, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: v ? "♟" : "×",
      detail: v ? s.hands[i].length + " cartas" : "Eliminado",
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
