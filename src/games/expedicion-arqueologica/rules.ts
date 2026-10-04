import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Site {
  cost: number;
  value: number;
  danger: number;
  claimed: number;
}
export interface State extends DeductionPosition {
  supplies: number[];
  knowledge: number[];
  sites: Site[];
  round: number;
}
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Explora ruinas, investiga o equipa tu expedición",
    supplies: Array(n).fill(5),
    knowledge: Array(n).fill(0),
    sites: Array.from({ length: 15 }, (_, i) => ({
      cost: 2 + (i % 4),
      value: 3 + (i % 6),
      danger: i % 3,
      claimed: -1,
    })),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return [
    { key: "equip", label: "Reponer tres provisiones" },
    { key: "study", label: "Investigar (+1 conocimiento)" },
    ...s.sites.flatMap((v, i) =>
      v.claimed < 0 && s.supplies[s.turn] >= v.cost
        ? [
            {
              key: "dig:" + i,
              label:
                "Excavar ruina " +
                (i + 1) +
                " · " +
                v.cost +
                " provisiones · " +
                v.value +
                " PV · peligro " +
                v.danger,
            },
          ]
        : [],
    ),
  ];
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  if (key === "equip") t.supplies[p] += 3;
  else if (key === "study") t.knowledge[p]++;
  else {
    const i = Number(key.split(":")[1]),
      v = t.sites[i];
    t.supplies[p] -= v.cost;
    const die = 1 + Math.floor(Math.random() * 6),
      success = die + t.knowledge[p] > v.danger + 2;
    t.message =
      "Dado " +
      die +
      " + conocimiento " +
      t.knowledge[p] +
      (success ? " · hallazgo logrado" : " · excavación fallida");
    if (success) {
      v.claimed = p;
      t.scores[p] += v.value;
      t.knowledge[p]++;
    } else t.supplies[p]++;
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (t.round > 15 || t.sites.every((v) => v.claimed >= 0)) {
    t.scores = t.scores.map((v, i) => v + t.knowledge[i]);
    t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const digs = actions(s).filter((a) => a.key.startsWith("dig:"));
  if (digs.length)
    return apply(
      s,
      digs.sort((a, b) => {
        const value = (key: string) => {
          const v = s.sites[Number(key.split(":")[1])];
          return (
            v.value -
            v.cost * 0.3 -
            Math.max(0, v.danger + 2 - s.knowledge[s.turn]) / 2
          );
        };
        return value(b.key) - value(a.key);
      })[0].key,
    );
  return apply(s, "equip");
}
export function view(s: State) {
  return {
    cards: s.supplies.map((v, i) => ({
      key: String(i),
      label:
        "J" +
        (i + 1) +
        " provisiones " +
        v +
        " · conocimiento " +
        s.knowledge[i],
      icon: "⌕",
    })),
    notes: [
      "Ronda " +
        s.round +
        "/15. Excavar requiere pagar antes de tirar un dado; éxito si dado + conocimiento > peligro + 2.",
      "Un fallo devuelve una provisión y deja la ruina disponible. Un éxito concede PV y conocimiento. El conocimiento puntúa también al final.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 5,
    cells: s.sites.map((v, i) => ({
      key: String(i),
      label: "Ruina " + (i + 1),
      symbol: v.claimed < 0 ? "⌂" : "⚑",
      owner: v.claimed >= 0 ? v.claimed : undefined,
      detail: v.value + " PV · coste " + v.cost + " · peligro " + v.danger,
      action: actions(s).some((a) => a.key === "dig:" + i)
        ? "dig:" + i
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
};
