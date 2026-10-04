import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Card {
  cost: number[];
  bonus: number;
  points: number;
  id: number;
}
export interface State extends DeductionPosition {
  tokens: number[][];
  bonuses: number[][];
  supply: number[];
  market: Card[];
  deck: Card[];
  reserved: Card[][];
  lastRound: boolean;
  rounds: number;
}
const names = ["Rubí", "Zafiro", "Esmeralda", "Ónix", "Ámbar", "Oro"],
  colors = ["#b96a69", "#648daa", "#6d9d7f", "#706579", "#c6a258"];
function card(id: number): Card {
  const bonus = id % 5,
    tier = Math.floor(id / 15) + 1,
    cost = Array(5).fill(0);
  cost[(bonus + 1) % 5] = tier + 1;
  cost[(bonus + 2) % 5] = tier;
  cost[(bonus + 3) % 5] = Math.max(0, tier - 1);
  return { id, bonus, cost, points: tier === 1 ? 0 : tier === 2 ? 1 : 3 };
}
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 45 }, (_, i) => card(i))),
    market = deck.splice(0, 6);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Compra joyas o recoge gemas",
    tokens: Array.from({ length: n }, () => Array(6).fill(0)),
    bonuses: Array.from({ length: n }, () => Array(5).fill(0)),
    supply: [...Array(5).fill(n === 2 ? 4 : n === 3 ? 5 : 7), 5],
    market,
    deck,
    reserved: Array.from({ length: n }, () => []),
    lastRound: false,
    rounds: 0,
  };
}
function payment(s: State, c: Card): number[] {
  return c.cost.map((v, i) => Math.max(0, v - s.bonuses[s.turn][i]));
}
function affordable(s: State, c: Card): boolean {
  return (
    payment(s, c).reduce(
      (sum, v, i) => sum + Math.max(0, v - s.tokens[s.turn][i]),
      0,
    ) <= s.tokens[s.turn][5]
  );
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const a: { key: string; label: string }[] = [];
  for (let i = 0; i < 5; i++)
    if (s.supply[i] >= 4)
      a.push({ key: "two:" + i, label: "Tomar dos " + names[i] });
  const available = [0, 1, 2, 3, 4].filter((i) => s.supply[i] > 0);
  if (available.length <= 3 && available.length)
    a.push({
      key: "take:" + available.join(","),
      label: "Tomar " + available.map((i) => names[i]).join(", "),
    });
  else
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        for (let k = j + 1; k < 5; k++)
          if ([i, j, k].every((x) => s.supply[x] > 0))
            a.push({
              key: "take:" + i + "," + j + "," + k,
              label: "Tomar " + [i, j, k].map((i) => names[i]).join(", "),
            });
  s.market.forEach((c, i) => {
    if (affordable(s, c))
      a.push({
        key: "buy:" + i,
        label: "Comprar " + names[c.bonus] + " " + c.points + " PV",
      });
    if (s.reserved[s.turn].length < 3)
      a.push({
        key: "reserve:" + i,
        label: "Reservar " + names[c.bonus] + " " + c.points + " PV",
      });
  });
  s.reserved[s.turn].forEach((c, i) => {
    if (affordable(s, c))
      a.push({ key: "own:" + i, label: "Comprar reserva " + (i + 1) });
  });
  if (!a.length) a.push({ key: "pass", label: "Pasar" });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [kind, raw] = key.split(":"),
    i = Number(raw);
  if (kind === "take" || kind === "two") {
    for (const j of kind === "take" ? raw.split(",").map(Number) : [i, i]) {
      t.tokens[p][j]++;
      t.supply[j]--;
    }
  } else if (kind === "reserve") {
    t.reserved[p].push(t.market[i]);
    if (t.supply[5]) {
      t.tokens[p][5]++;
      t.supply[5]--;
    }
    if (t.deck.length) t.market[i] = t.deck.pop()!;
    else t.market.splice(i, 1);
  } else if (kind === "buy" || kind === "own") {
    const c = kind === "buy" ? t.market[i] : t.reserved[p][i];
    for (const [j, cost] of payment(t, c).entries()) {
      const paid = Math.min(cost, t.tokens[p][j]);
      t.tokens[p][j] -= paid;
      t.supply[j] += paid;
      const gold = cost - paid;
      t.tokens[p][5] -= gold;
      t.supply[5] += gold;
    }
    t.bonuses[p][c.bonus]++;
    t.scores[p] += c.points;
    if (kind === "own") t.reserved[p].splice(i, 1);
    else if (t.deck.length) t.market[i] = t.deck.pop()!;
    else t.market.splice(i, 1);
  }
  while (t.tokens[p].reduce((a, b) => a + b, 0) > 10) {
    const j = t.tokens[p]
      .slice(0, 5)
      .reduce((best, v, i) => (v > t.tokens[p][best] ? i : best), 0);
    t.tokens[p][j]--;
    t.supply[j]++;
  }
  t.step++;
  t.lastRound ||= t.scores[p] >= 15;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.rounds++;
  if ((t.lastRound && t.turn === 0) || t.rounds >= 60)
    t.winner = champion(t.scores);
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  const buys = a.filter(
    (a) => a.key.startsWith("buy:") || a.key.startsWith("own:"),
  );
  if (buys.length)
    return apply(
      s,
      buys.sort((a, b) => {
        const c = (k: string) =>
          k.startsWith("own")
            ? s.reserved[s.turn][Number(k.split(":")[1])]
            : s.market[Number(k.split(":")[1])];
        return c(b.key).points - c(a.key).points;
      })[0].key,
    );
  const takes = a.filter((a) => a.key.startsWith("take:"));
  return apply(s, (takes.length ? pick(takes) : a[0]).key);
}
export function view(s: State) {
  return {
    cards: s.market.map((c, i) => ({
      key: String(c.id),
      label:
        names[c.bonus] +
        " · " +
        c.points +
        " PV · coste " +
        c.cost
          .map((v, j) => (v ? v + " " + names[j] : ""))
          .filter(Boolean)
          .join(" / "),
      icon: "◆",
      color: colors[c.bonus],
      action: affordable(s, c) ? "buy:" + i : undefined,
    })),
    notes: s.tokens
      .map(
        (t, i) =>
          "J" +
          (i + 1) +
          " gemas " +
          t.map((v, j) => v + " " + names[j]).join(" · ") +
          "; descuentos " +
          s.bonuses[i].join("/"),
      )
      .concat(
        "Suministro " +
          s.supply.join("/") +
          " · Reservas propias: " +
          s.reserved[s.turn]
            .map((c) => names[c.bonus] + " " + c.points + " PV")
            .join(", "),
        "15 PV inicia la última ronda; todos juegan igual número de turnos. Límite de sesión: 60 rondas.",
      ),
  };
}
export function scene(s: State) {
  return {
    columns: 5,
    cells: names
      .slice(0, 5)
      .map((name, i) => ({
        key: String(i),
        label: name,
        symbol: "◆",
        detail: s.supply[i] + " disponibles",
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
