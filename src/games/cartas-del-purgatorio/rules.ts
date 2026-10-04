import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  deck: number[];
  trick: { player: number; card: number }[];
  leader: number;
  trump: number;
  round: number;
}
function suit(c: number) {
  return Math.floor(c / 9);
}
function rank(c: number) {
  return (c % 9) + 1;
}
const suits = ["☀", "☾", "✦", "♧"];
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 36 }, (_, i) => i)),
    hands = Array.from({ length: n }, () => deck.splice(0, Math.floor(36 / n)));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Juega una carta siguiendo el símbolo de salida",
    hands,
    deck,
    trick: [],
    leader: 0,
    trump: Math.floor(Math.random() * 4),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const lead = s.trick.length ? suit(s.trick[0].card) : -1,
    follow = s.hands[s.turn].some((c) => suit(c) === lead);
  return s.hands[s.turn].flatMap((c, i) =>
    !follow || suit(c) === lead
      ? [{ key: String(i), label: "Jugar " + rank(c) + suits[suit(c)] }]
      : [],
  );
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    c = t.hands[p].splice(Number(key), 1)[0];
  t.trick.push({ player: p, card: c });
  t.step++;
  if (t.trick.length < t.hands.length) t.turn = (p + 1) % t.hands.length;
  else {
    const lead = suit(t.trick[0].card),
      weight = (c: number) =>
        rank(c) + (suit(c) === t.trump ? 100 : suit(c) === lead ? 50 : 0),
      winner = [...t.trick].sort((a, b) => weight(b.card) - weight(a.card))[0]
        .player;
    const curse = t.trick
      .filter((x) => suit(x.card) === 1)
      .reduce((v, x) => v + rank(x.card), 0);
    t.scores[winner] += curse ? -curse : 5;
    t.message =
      "Baza J" + (winner + 1) + (curse ? " · castigo " + curse : " · +5 PV");
    t.turn = winner;
    t.leader = winner;
    t.trick = [];
    t.round++;
    if (t.hands.every((h) => !h.length)) t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    value = (key: string) => {
      const c = s.hands[s.turn][Number(key)];
      return s.trick.some((x) => suit(x.card) === 1)
        ? -rank(c) - (suit(c) === s.trump ? 20 : 0)
        : rank(c) + (suit(c) === s.trump ? 20 : 0);
    };
  return apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    private: "Triunfo: " + suits[s.trump],
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: rank(c) + suits[suit(c)],
      icon: suits[suit(c)],
      action: actions(s).some((a) => a.key === String(i))
        ? String(i)
        : undefined,
    })),
    notes: [
      "Baza " + s.round + " · triunfo " + suits[s.trump],
      "Hay que seguir el símbolo de salida si puedes. Gana el mayor triunfo, o el mayor del símbolo inicial.",
      "Si la baza contiene lunas, el ganador pierde la suma de sus rangos; si no, gana cinco puntos. Al agotar manos gana el saldo mayor. Cartas originales, no una variante de una baraja comercial.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.hands.length,
    cells: Array.from({ length: s.hands.length }, (_, i) => {
      const c = s.trick.find((t) => t.player === i);
      return {
        key: String(i),
        label: "J" + (i + 1),
        symbol: c ? suits[suit(c.card)] : "▤",
        detail: c ? String(rank(c.card)) : s.hands[i].length + " cartas",
      };
    }),
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
