import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  decks: number[][];
  hands: number[][];
  discards: number[][];
  supply: number[];
  actionsLeft: number;
  money: number;
  round: number;
}
const names = [
    "Cobre",
    "Plata",
    "Oro",
    "Finca",
    "Ducado",
    "Provincia",
    "Molino",
    "Aldea",
    "Mina",
  ],
  cost = [0, 3, 6, 2, 5, 8, 4, 3, 5],
  vp = [0, 0, 0, 1, 3, 6, 0, 0, 0],
  treasure = [1, 2, 3, 0, 0, 0, 0, 0, 0];
function draw(t: State, p: number, n: number) {
  for (let i = 0; i < n; i++) {
    if (!t.decks[p].length) {
      t.decks[p] = shuffle(t.discards[p]);
      t.discards[p] = [];
    }
    if (t.decks[p].length) t.hands[p].push(t.decks[p].pop()!);
  }
}
function prepare(t: State) {
  t.actionsLeft = 1;
  t.money = t.hands[t.turn].reduce((v, c) => v + treasure[c], 0);
}
export function initial(n: number): State {
  const t: State = {
    turn: 0,
    winner: null,
    scores: Array(n).fill(3),
    step: 0,
    message: "Juega acciones y compra una carta",
    decks: Array.from({ length: n }, () =>
      shuffle([0, 0, 0, 0, 0, 0, 0, 3, 3, 3]),
    ),
    hands: Array.from({ length: n }, () => []),
    discards: Array.from({ length: n }, () => []),
    supply: [40, 30, 20, n * 8, n * 8, n * 6, 10, 10, 10],
    actionsLeft: 1,
    money: 0,
    round: 1,
  };
  for (let p = 0; p < n; p++) draw(t, p, 5);
  prepare(t);
  return t;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const a = [{ key: "end", label: "Terminar sin comprar" }];
  s.supply.forEach((v, i) => {
    if (v && s.money >= cost[i])
      a.push({
        key: "buy:" + i,
        label: "Comprar " + names[i] + " (" + cost[i] + ") y terminar",
      });
  });
  s.hands[s.turn].forEach((c, i) => {
    if (s.actionsLeft && c >= 6 && (c !== 8 || s.hands[s.turn].includes(0)))
      a.push({ key: "play:" + i, label: "Jugar " + names[c] });
  });
  return a;
}
function tally(t: State) {
  t.scores = t.hands.map((h, p) =>
    [...h, ...t.decks[p], ...t.discards[p]].reduce((v, c) => v + vp[c], 0),
  );
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [kind, raw] = key.split(":"),
    i = Number(raw);
  t.step++;
  if (kind === "play") {
    const c = t.hands[p].splice(i, 1)[0];
    t.discards[p].push(c);
    t.actionsLeft--;
    if (c === 6) draw(t, p, 3);
    if (c === 7) {
      draw(t, p, 1);
      t.actionsLeft += 2;
    }
    if (c === 8) {
      const j = t.hands[p].indexOf(0);
      t.hands[p].splice(j, 1);
      if (t.supply[1]) {
        t.supply[1]--;
        t.hands[p].push(1);
      }
    }
    t.money = t.hands[p].reduce((v, c) => v + treasure[c], 0);
  } else {
    if (kind === "buy") {
      t.supply[i]--;
      t.discards[p].push(i);
    }
    t.discards[p].push(...t.hands[p]);
    t.hands[p] = [];
    draw(t, p, 5);
    t.turn = (p + 1) % t.scores.length;
    if (t.turn === 0) t.round++;
    prepare(t);
  }
  tally(t);
  if (
    !t.supply[5] ||
    t.supply.filter((v) => v === 0).length >= 3 ||
    t.round > 30
  )
    t.winner = champion(t.scores);
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    play =
      a.find(
        (a) =>
          a.key.startsWith("play:") &&
          s.hands[s.turn][Number(a.key.split(":")[1])] === 7,
      ) || a.find((a) => a.key.startsWith("play:"));
  if (play) return apply(s, play.key);
  const wanted = s.round < 18 ? [5, 2, 6, 1, 7, 8, 4, 3] : [5, 4, 3, 2, 1];
  return apply(
    s,
    wanted.map((i) => "buy:" + i).find((k) => a.some((a) => a.key === k)) ||
      "end",
  );
}
export function view(s: State) {
  return {
    private: "Monedas " + s.money + " · acciones " + s.actionsLeft,
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c],
      icon: c <= 2 ? "◉" : c <= 5 ? "⌂" : "▤",
      action: actions(s).some((a) => a.key === "play:" + i)
        ? "play:" + i
        : undefined,
    })),
    notes: [
      "Ronda " +
        s.round +
        "/30 · tu mazo " +
        s.decks[s.turn].length +
        " · descarte " +
        s.discards[s.turn].length,
      "Molino roba 3; Aldea roba 1 y da +2 acciones; Mina destruye un Cobre de tu mano y gana una Plata a la mano si hay.",
      "Los tesoros se suman automáticamente. Comprar termina el turno. Fincas / ducados / provincias puntúan 1 / 3 / 6. No se publican las puntuaciones de mazos rivales durante la partida.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 3,
    cells: names.map((label, i) => ({
      key: String(i),
      label,
      symbol: i <= 2 ? "◉" : i <= 5 ? "⌂" : "▤",
      detail: "Coste " + cost[i] + " · quedan " + s.supply[i],
      action: actions(s).some((a) => a.key === "buy:" + i)
        ? "buy:" + i
        : undefined,
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
  publicScores: (s) =>
    s.winner === null ? s.scores.map(() => null) : s.scores,
};
