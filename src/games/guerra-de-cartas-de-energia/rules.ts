import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  health: number[];
  energy: number[];
  hands: number[][];
  deck: number[];
  discard: number[];
  phase: "play" | "defend";
  attacker: number;
  damage: number;
  round: number;
}
const names = [
    "Rayo",
    "Escudo",
    "Sobrecarga",
    "Curación",
    "Drenaje",
    "Cristal",
  ],
  cost = [2, 1, 4, 3, 3, 0];
function draw(t: State, p: number) {
  if (!t.deck.length) {
    t.deck = shuffle(t.discard);
    t.discard = [];
  }
  if (t.deck.length) t.hands[p].push(t.deck.pop()!);
}
export function initial(n: number): State {
  n = 2;
  const deck = shuffle(Array.from({ length: 54 }, (_, i) => i % 6));
  return {
    turn: 0,
    winner: null,
    scores: [20, 20],
    step: 0,
    message: "Juega una carta o prepara energía",
    health: [20, 20],
    energy: [4, 4],
    hands: [deck.splice(0, 5), deck.splice(0, 5)],
    deck,
    discard: [],
    phase: "play",
    attacker: -1,
    damage: 0,
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "defend")
    return [
      { key: "accept", label: "Recibir " + s.damage + " daño" },
      ...s.hands[s.turn].flatMap((c, i) =>
        c === 1 && s.energy[s.turn] >= 1
          ? [
              {
                key: "block:" + i,
                label: "Escudo: bloquear hasta 3 daño (1 energía)",
              },
            ]
          : [],
      ),
    ];
  return [
    { key: "charge", label: "Recargar 3 energía y robar" },
    ...s.hands[s.turn].flatMap((c, i) =>
      c !== 1 && s.energy[s.turn] >= cost[c]
        ? [{ key: "play:" + i, label: names[c] + " · " + cost[c] + " energía" }]
        : [],
    ),
  ];
}
function next(t: State, p: number) {
  t.scores = [...t.health];
  if (t.health.some((h) => h <= 0)) {
    t.winner = t.health[0] <= 0 ? 1 : 0;
    return;
  }
  t.turn = 1 - p;
  t.energy[t.turn] = Math.min(12, t.energy[t.turn] + 1);
  draw(t, t.turn);
  t.phase = "play";
  t.message = "Juega una carta o prepara energía";
  if (t.turn === 0) t.round++;
  if (t.round > 35) t.winner = champion(t.health);
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  t.step++;
  if (t.phase === "defend") {
    let amount = t.damage;
    if (key.startsWith("block:")) {
      t.hands[p].splice(Number(key.split(":")[1]), 1);
      t.discard.push(1);
      t.energy[p]--;
      amount = Math.max(0, amount - 3);
    }
    t.health[p] -= amount;
    next(t, t.attacker);
    return t;
  }
  if (key === "charge") {
    t.energy[p] = Math.min(12, t.energy[p] + 3);
    draw(t, p);
    next(t, p);
    return t;
  }
  const c = t.hands[p].splice(Number(key.split(":")[1]), 1)[0];
  t.discard.push(c);
  t.energy[p] -= cost[c];
  if (c === 0 || c === 2 || c === 4) {
    t.damage = c === 2 ? 6 : c === 4 ? 2 : 3;
    if (c === 4) t.energy[p] = Math.min(12, t.energy[p] + 2);
    t.attacker = p;
    t.turn = 1 - p;
    t.phase = "defend";
    t.message = "Rival: decide si usas un escudo";
  } else {
    if (c === 3) t.health[p] = Math.min(20, t.health[p] + 4);
    if (c === 5) {
      t.energy[p] = Math.min(12, t.energy[p] + 2);
      draw(t, p);
    }
    next(t, p);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (s.phase === "defend")
    return apply(s, a.find((a) => a.key.startsWith("block:"))?.key || "accept");
  const p = s.turn,
    healing = a.find(
      (a) =>
        a.key.startsWith("play:") &&
        s.hands[p][Number(a.key.split(":")[1])] === 3,
    );
  if (healing && s.health[p] <= 14) return apply(s, healing.key);
  const attack = a.find(
    (a) =>
      a.key.startsWith("play:") &&
      [2, 0, 4].includes(s.hands[p][Number(a.key.split(":")[1])]),
  );
  return apply(
    s,
    attack?.key ||
      a.find(
        (a) =>
          a.key.startsWith("play:") &&
          s.hands[p][Number(a.key.split(":")[1])] === 5,
      )?.key ||
      "charge",
  );
}
export function view(s: State) {
  return {
    private: "Tu energía: " + s.energy[s.turn] + "/12",
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c] + " · coste " + cost[c],
      icon: ["⚡", "◇", "✦", "♥", "◒", "◆"][c],
      action: actions(s).some((a) => a.key === "play:" + i)
        ? "play:" + i
        : undefined,
    })),
    notes: [
      "Vida " + s.health.join("/") + " · ronda " + s.round + "/35",
      "Rayo 3 daño, Sobrecarga 6, Drenaje 2 daño y +2 energía, Curación +4 vida, Cristal +2 energía y roba.",
      "Tras atacar decide el defensor; luego inicia su turno normal. Los escudos bloquean hasta tres daños. Las cartas usadas se reciclan al agotar el mazo.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 2,
    cells: s.health.map((v, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: "⚡",
      owner: i,
      detail:
        v +
        " vida · " +
        s.energy[i] +
        " energía · " +
        s.hands[i].length +
        " cartas",
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
