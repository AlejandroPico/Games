import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  lands: { owner: number; defense: number }[];
  influence: number[];
  round: number;
}
const names = [
  "Infantería",
  "Caballería",
  "Fortaleza",
  "Diplomacia",
  "Impuesto",
  "Espía",
];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(2),
    step: 0,
    message: "Juega una orden en el mapa de provincias",
    hands: Array.from({ length: n }, () =>
      Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)),
    ),
    lands: Array.from({ length: 12 }, (_, i) => ({
      owner: i < n ? i : -1,
      defense: i < n ? 2 : 1,
    })),
    influence: Array(n).fill(3),
    round: 1,
  };
}
function neighbors(i: number) {
  return [
    i % 4 ? i - 1 : -1,
    i % 4 < 3 ? i + 1 : -1,
    i >= 4 ? i - 4 : -1,
    i < 8 ? i + 4 : -1,
  ].filter((i) => i >= 0);
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn,
    a = [{ key: "rest", label: "Reunir dos influencias y robar una orden" }];
  s.hands[p].forEach((c, k) => {
    if (c === 4)
      a.push({ key: "tax:" + k, label: "Recaudar: influencia por provincias" });
    else
      s.lands.forEach((l, i) => {
        if (c === 2 && l.owner === p)
          a.push({
            key: "play:" + k + "," + i,
            label: "Fortificar provincia " + (i + 1),
          });
        if (c === 3 && l.owner !== p && s.influence[p] >= l.defense + 2)
          a.push({
            key: "play:" + k + "," + i,
            label:
              "Diplomacia provincia " + (i + 1) + " por " + (l.defense + 2),
          });
        if (
          (c === 0 || c === 1) &&
          l.owner !== p &&
          neighbors(i).some((j) => s.lands[j].owner === p)
        )
          a.push({
            key: "play:" + k + "," + i,
            label: names[c] + " a provincia " + (i + 1),
          });
        if (c === 5 && l.owner !== p)
          a.push({
            key: "play:" + k + "," + i,
            label: "Espía: debilitar provincia " + (i + 1),
          });
      });
  });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  if (key === "rest") {
    t.influence[p] += 2;
    if (t.hands[p].length < 10) t.hands[p].push(Math.floor(Math.random() * 6));
  } else {
    const [a, raw] = key.split(":"),
      [k, i] = raw.split(",").map(Number),
      c = t.hands[p].splice(k, 1)[0];
    if (a === "tax")
      t.influence[p] += t.lands.filter((l) => l.owner === p).length;
    else {
      const land = t.lands[i];
      if (c === 2) land.defense = Math.min(6, land.defense + 2);
      if (c === 3) {
        t.influence[p] -= land.defense + 2;
        land.owner = p;
        land.defense = 1;
      }
      if (c === 5) land.defense = Math.max(1, land.defense - 2);
      if (c === 0 || c === 1) {
        const strength = 1 + Math.floor(Math.random() * 6) + (c === 1 ? 2 : 0);
        if (strength > land.defense) {
          land.owner = p;
          land.defense = 2;
        } else land.defense = Math.max(1, land.defense - 1);
      }
    }
    if (t.hands[p].length < 10) t.hands[p].push(Math.floor(Math.random() * 6));
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) {
    t.round++;
    t.scores = t.scores.map(
      (v, p) => v + t.lands.filter((l) => l.owner === p).length,
    );
  }
  if (t.round > 12) {
    t.scores = t.scores.map((v, i) => v + Math.floor(t.influence[i] / 3));
    t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    value = (key: string) => {
      if (key === "rest") return 1;
      const [kind, raw] = key.split(":"),
        [k, i] = raw.split(",").map(Number),
        c = s.hands[s.turn][k];
      if (kind === "tax") return 0.5;
      return c === 3
        ? 5
        : c <= 1
          ? 5 - s.lands[i].defense / 2 + (c === 1 ? 1 : 0)
          : c === 5
            ? 1
            : 0;
    };
  return apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    private: "Influencia: " + s.influence[s.turn],
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c],
      icon: ["♟", "♞", "⌂", "♔", "◉", "◈"][c],
    })),
    notes: [
      "Ronda " +
        s.round +
        "/12. Al cerrar cada ronda, cada provincia propia concede un punto.",
      "Infantería ataca con dado; Caballería añade 2. Debes tener una provincia vecina. Supera defensa para conquistar; fallar reduce la defensa uno.",
      "Fortaleza +2 defensa; Diplomacia compra una provincia pagando defensa+2; Espía baja defensa 2; Impuesto concede influencia por provincias. Ninguna orden revela manos rivales.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.lands.map((l, i) => ({
      key: String(i),
      label: "Provincia " + (i + 1),
      symbol: l.owner >= 0 ? "⚑" : "◇",
      owner: l.owner >= 0 ? l.owner : undefined,
      detail:
        (l.owner >= 0 ? "J" + (l.owner + 1) + " · " : "Neutral · ") +
        "defensa " +
        l.defense,
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
