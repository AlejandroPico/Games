import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Bird {
  name: string;
  habitat: number;
  cost: number;
  points: number;
  eggs: number;
  power: number;
}
export interface State extends DeductionPosition {
  food: number[];
  eggs: number[];
  aviaries: Bird[][];
  market: Bird[];
  deck: Bird[];
  round: number;
}
const species = [
    "Mirlo",
    "Águila",
    "Garza",
    "Petirrojo",
    "Búho",
    "Cisne",
    "Gorrión",
    "Colibrí",
    "Flamenco",
  ],
  habitats = ["Bosque", "Pradera", "Humedal"];
function bird(i: number): Bird {
  return {
    name: species[i % 9],
    habitat: i % 3,
    cost: 1 + (i % 3),
    points: 2 + (i % 5),
    eggs: 1 + (i % 3),
    power: i % 3,
  };
}
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 36 }, (_, i) => bird(i)));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Atrae un ave o activa un hábitat",
    food: Array(n).fill(3),
    eggs: Array(n).fill(0),
    aviaries: Array.from({ length: n }, () => []),
    market: deck.splice(0, 4),
    deck,
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn;
  return [
    { key: "food", label: "Bosque: obtener alimento" },
    { key: "eggs", label: "Pradera: poner huevos" },
    { key: "watch", label: "Humedal: observar y renovar oferta" },
    ...s.market.flatMap((b, i) =>
      s.food[p] >= b.cost &&
      s.aviaries[p].filter((a) => a.habitat === b.habitat).length < 4
        ? [
            {
              key: "bird:" + i,
              label: "Atraer " + b.name + " (" + b.cost + " alimento)",
            },
          ]
        : [],
    ),
  ];
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    activate = (h: number) => {
      for (const b of t.aviaries[p].filter((b) => b.habitat === h)) {
        if (b.power === 0) t.food[p]++;
        if (b.power === 1) t.eggs[p]++;
        if (b.power === 2) t.scores[p]++;
      }
    };
  if (key === "food") {
    t.food[p] += 2;
    activate(0);
  } else if (key === "eggs") {
    const cap = t.aviaries[p].reduce((n, b) => n + b.eggs, 0);
    t.eggs[p] = Math.min(
      cap,
      t.eggs[p] + 2 + t.aviaries[p].filter((b) => b.habitat === 1).length,
    );
    activate(1);
    t.eggs[p] = Math.min(cap, t.eggs[p]);
  } else if (key === "watch") {
    t.scores[p]++;
    activate(2);
    if (t.deck.length) t.market[0] = t.deck.pop()!;
  } else {
    const i = Number(key.split(":")[1]),
      b = t.market[i];
    t.food[p] -= b.cost;
    t.aviaries[p].push(b);
    t.scores[p] += b.points;
    if (t.deck.length) t.market[i] = t.deck.pop()!;
    else t.market.splice(i, 1);
  }
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (t.round > 12) {
    t.scores = t.scores.map(
      (v, i) =>
        v + t.eggs[i] + 3 * new Set(t.aviaries[i].map((b) => b.habitat)).size,
    );
    t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    birds = a.filter((a) => a.key.startsWith("bird:"));
  if (birds.length && s.round < 11)
    return apply(
      s,
      birds.sort(
        (a, b) =>
          s.market[Number(b.key.split(":")[1])].points -
          s.market[Number(a.key.split(":")[1])].points,
      )[0].key,
    );
  const p = s.turn,
    cap = s.aviaries[p].reduce((n, b) => n + b.eggs, 0);
  return apply(
    s,
    s.round >= 10 && s.eggs[p] < cap
      ? "eggs"
      : s.food[p] < 3
        ? "food"
        : "watch",
  );
}
export function view(s: State) {
  return {
    cards: s.market.map((b, i) => ({
      key: String(i),
      label:
        b.name +
        " · " +
        habitats[b.habitat] +
        " · " +
        b.cost +
        " alimento · " +
        b.points +
        " PV",
      icon: "♧",
      action: s.food[s.turn] >= b.cost ? "bird:" + i : undefined,
    })),
    notes: [
      "Ronda " +
        s.round +
        "/12. Alimento " +
        s.food.join("/") +
        " · huevos " +
        s.eggs.join("/"),
      "Cada ave del hábitat activado produce según su poder: bosque alimento, pradera huevo, humedal PV. Máximo cuatro aves por hábitat.",
      "Al final cada huevo vale 1 PV y cada hábitat ocupado 3 PV.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 3,
    cells: habitats.map((label, h) => ({
      key: String(h),
      label,
      symbol: ["♣", "❀", "≈"][h],
      detail:
        s.aviaries[s.turn]
          .filter((b) => b.habitat === h)
          .map((b) => b.name)
          .join(", ") || "Sin aves",
      action: ["food", "eggs", "watch"][h],
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
