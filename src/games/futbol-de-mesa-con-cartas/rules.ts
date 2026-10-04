import { shuffled } from "../../shared/cards";
export const names = [
  "Pase",
  "Regate",
  "Disparo",
  "Presión",
  "Corte",
  "Portero",
];
export type State = {
  hands: number[][];
  stock: number[][];
  discard: number[][];
  possession: number;
  zone: number;
  turn: number;
  phase: "attack" | "defend";
  attack: number;
  round: number;
  scores: number[];
  winner: number[] | null;
  ply: number;
  log: string;
  roll: number;
};
export const initial = (): State => {
  const stock = [0, 1].map(() =>
    shuffled(Array.from({ length: 30 }, (_, i) => i % 6)),
  );
  return {
    hands: stock.map((s) => s.splice(0, 5)),
    stock,
    discard: [[], []],
    possession: 0,
    zone: 0,
    turn: 0,
    phase: "attack",
    attack: -1,
    round: 0,
    scores: [0, 0],
    winner: null,
    ply: 0,
    log: "El balón está en el centro del campo.",
    roll: 0,
  };
};
function replenish(s: State, p: number) {
  if (!s.stock[p].length) {
    s.stock[p] = shuffled(s.discard[p]);
    s.discard[p] = [];
  }
  while (s.hands[p].length < 5 && s.stock[p].length)
    s.hands[p].push(s.stock[p].pop()!);
}
export function legal(s: State) {
  return s.hands[s.turn].map((_, i) => i);
}
export function play(s: State, index: number): State {
  if (s.winner || !legal(s).includes(index)) return s;
  const x = structuredClone(s),
    type = x.hands[x.turn].splice(index, 1)[0];
  x.discard[x.turn].push(type);
  x.ply++;
  if (x.phase === "attack") {
    x.attack = type;
    x.phase = "defend";
    x.turn = 1 - x.possession;
    replenish(x, x.possession);
    x.log = `J${x.possession + 1}: ${names[type]}. J${x.turn + 1}, responde.`;
    return x;
  }
  x.roll = 1 + Math.floor(Math.random() * 6);
  const attack = x.attack === 2 && x.zone < 2 ? 0 : x.attack < 3 ? x.attack : 0,
    counter = attack === 0 ? 4 : attack === 1 ? 3 : 5,
    defense = type === counter ? 4 : type >= 3 ? 2 : 0,
    success = x.roll + (attack === 2 ? x.zone : 2) > defense + 4;
  if (attack === 2) {
    if (success) {
      x.scores[x.possession]++;
      x.log = `¡Gol de J${x.possession + 1}!`;
    } else x.log = "Disparo detenido.";
    x.possession = 1 - x.possession;
    x.zone = 0;
  } else if (success) {
    x.zone = Math.min(4, x.zone + (attack === 1 ? 2 : 1));
    x.log = `Avance hasta la zona ${x.zone}.`;
  } else {
    x.possession = 1 - x.possession;
    x.zone = 0;
    x.log = "Recuperación: cambia la posesión.";
  }
  replenish(x, x.turn);
  x.phase = "attack";
  x.turn = x.possession;
  x.attack = -1;
  x.round++;
  if (x.round >= 20 || Math.max(...x.scores) >= 3) {
    const max = Math.max(...x.scores);
    x.winner = x.scores.flatMap((v, p) => (v === max ? [p] : []));
  }
  return x;
}
export function automatic(s: State): State {
  const hand = s.hands[s.turn],
    opts = legal(s);
  if (s.phase === "defend") {
    const counter = s.attack === 2 ? 5 : s.attack === 1 ? 3 : 4;
    return play(
      s,
      opts.find((i) => hand[i] === counter) ??
        opts.find((i) => hand[i] >= 3) ??
        opts[0],
    );
  }
  return play(
    s,
    opts.find((i) => hand[i] === 2 && s.zone >= 2) ??
      opts.find((i) => hand[i] === 1) ??
      opts.find((i) => hand[i] === 0) ??
      opts[0],
  );
}
