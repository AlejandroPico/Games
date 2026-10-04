import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  deck: number[];
  claimed: number;
  played: number[];
  actor: number;
  phase: "claim" | "respond";
  passes: number;
  pile: number;
  round: number;
  history: string[];
}
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 48 }, (_, i) => (i % 6) + 1));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Descarta una carta declarando un valor",
    hands: Array.from({ length: n }, () => deck.splice(0, 7)),
    deck,
    claimed: 1,
    played: [],
    actor: 0,
    phase: "claim",
    passes: 0,
    pile: 0,
    round: 1,
    history: [],
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "respond")
    return [
      { key: "trust", label: "Aceptar declaración" },
      { key: "challenge", label: "Desafiar: revelar carta" },
    ];
  return s.hands[s.turn].flatMap((_, i) =>
    Array.from({ length: 6 }, (_, j) => ({
      key: "claim:" + i + "," + (j + 1),
      label: "Jugar carta " + (i + 1) + " y declarar " + (j + 1),
    })),
  );
}
function next(t: State) {
  t.turn = (t.actor + 1) % t.hands.length;
  t.phase = "claim";
  t.message = "Descarta una carta declarando un valor";
  t.played = [];
  t.round++;
  t.scores = t.hands.map((h) => 7 - h.length);
  if (t.round > 60) t.winner = champion(t.scores);
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s);
  t.step++;
  if (t.phase === "claim") {
    const [i, value] = key.split(":")[1].split(",").map(Number);
    t.actor = t.turn;
    t.claimed = value;
    t.played = [t.hands[t.turn].splice(i, 1)[0]];
    t.pile++;
    t.passes = 0;
    t.turn = (t.turn + 1) % t.hands.length;
    t.phase = "respond";
    t.message = "Rival: acepta o desafía la declaración";
  } else if (key === "challenge") {
    const liar = t.played[0] !== t.claimed,
      loser = liar ? t.actor : t.turn;
    for (let i = 0; i < t.pile; i++) {
      if (!t.deck.length)
        t.deck = shuffle(Array.from({ length: 36 }, (_, i) => (i % 6) + 1));
      t.hands[loser].push(t.deck.pop()!);
    }
    t.history.push(
      "J" +
        (t.actor + 1) +
        " declaró " +
        t.claimed +
        ", mostró " +
        t.played[0] +
        "; penalización " +
        t.pile +
        " a J" +
        (loser + 1),
    );
    t.pile = 0;
    if (!t.hands[t.actor].length) t.winner = t.actor;
    else next(t);
  } else {
    t.passes++;
    if (t.passes === t.hands.length - 1) {
      if (!t.hands[t.actor].length) t.winner = t.actor;
      else next(t);
    } else t.turn = (t.turn + 1) % t.hands.length;
  }
  if (t.winner !== null) t.scores = t.hands.map((h) => -h.length);
  return t;
}
export function automatic(s: State): State {
  if (s.phase === "respond") {
    const own = s.hands[s.turn].filter((v) => v === s.claimed).length,
      challenge =
        own >= 4 || s.hands[s.actor].length === 0 || Math.random() < 0.2;
    return apply(s, challenge ? "challenge" : "trust");
  }
  const i = Math.floor(Math.random() * s.hands[s.turn].length),
    card = s.hands[s.turn][i],
    value = Math.random() < 0.75 ? card : Math.floor(Math.random() * 6) + 1;
  return apply(s, "claim:" + i + "," + value);
}
export function view(s: State) {
  return {
    cards: s.hands[s.turn].map((v, i) => ({
      key: String(i),
      label: "Carta " + v,
      icon: "▤",
    })),
    notes: [
      "Mesa acumulada " +
        s.pile +
        " cartas · turno declarado: J" +
        (s.actor + 1) +
        " afirma " +
        s.claimed,
      ...s.hands.map((h, i) => "J" + (i + 1) + ": " + h.length + " cartas"),
      ...s.history.slice(-4),
      "La carta jugada no se muestra hasta un desafío. El mentiroso recibe tantas cartas de penalización como el montón; si decía verdad, las recibe quien desafió.",
      "La victoria por quedarse sin cartas espera a todas las respuestas. Edición original: las penalizaciones se roban del suministro, no recuperan el montón físico.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.hands.length,
    cells: s.hands.map((h, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: "▤",
      detail: h.length + " cartas",
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
