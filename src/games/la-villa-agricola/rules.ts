import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface Farm {
  food: number;
  wood: number;
  grain: number;
  sheep: number;
  fields: number;
  family: number;
  oven: boolean;
}
export interface State extends DeductionPosition {
  farms: Farm[];
  round: number;
  used: number[];
  workers: number[];
  stock: number[];
}
const spaces = [
  "Bosque",
  "Pesca",
  "Semillas",
  "Arar",
  "Criar ovejas",
  "Ampliar familia",
  "Construir horno",
  "Cosechar",
];
export function initial(n: number): State {
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Coloca un trabajador en un espacio libre",
    farms: Array.from({ length: n }, () => ({
      food: 4,
      wood: 0,
      grain: 0,
      sheep: 0,
      fields: 0,
      family: 2,
      oven: false,
    })),
    round: 1,
    used: [],
    workers: Array(n).fill(2),
    stock: [3, 2, 1, 0, 1, 0, 0, 0],
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const f = s.farms[s.turn];
  return spaces.flatMap((label, i) =>
    !s.used.includes(i) &&
    (i !== 5 || (f.wood >= 4 && f.family < 4)) &&
    (i !== 6 || (f.wood >= 3 && !f.oven))
      ? [{ key: String(i), label }]
      : [],
  );
}
function harvest(t: State) {
  t.farms.forEach((f, i) => {
    f.food += f.fields * Math.min(1, f.grain);
    if (f.sheep >= 2) f.sheep++;
    if (f.oven) {
      f.food += f.sheep * 2;
      f.sheep = 0;
    }
    const cost = f.family * 2,
      missing = Math.max(0, cost - f.food);
    f.food = Math.max(0, f.food - cost);
    t.scores[i] -= missing * 3;
  });
  if (t.round === 6) {
    t.farms.forEach(
      (f, i) =>
        (t.scores[i] +=
          f.family * 3 +
          f.fields * 2 +
          f.grain +
          f.sheep +
          Math.floor(f.wood / 2) +
          (f.oven ? 3 : 0)),
    );
    t.winner = champion(t.scores);
  } else {
    t.round++;
    t.used = [];
    t.workers = t.farms.map((f) => f.family);
    t.stock[0] += 3;
    t.stock[1] += 2;
    t.stock[2]++;
    t.stock[4]++;
    t.turn = (t.round - 1) % t.scores.length;
  }
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    i = Number(key),
    p = t.turn,
    f = t.farms[p];
  t.used.push(i);
  if (i === 0) {
    f.wood += t.stock[0];
    t.stock[0] = 0;
  }
  if (i === 1) {
    f.food += t.stock[1];
    t.stock[1] = 0;
  }
  if (i === 2) {
    f.grain += t.stock[2];
    t.stock[2] = 0;
  }
  if (i === 3) f.fields++;
  if (i === 4) {
    f.sheep += t.stock[4];
    t.stock[4] = 0;
  }
  if (i === 5) {
    f.wood -= 4;
    f.family++;
  }
  if (i === 6) {
    f.wood -= 3;
    f.oven = true;
  }
  if (i === 7) f.food += 2 + f.fields * Math.max(1, f.grain);
  t.workers[p]--;
  t.step++;
  for (let k = 1; k <= t.scores.length; k++) {
    const next = (p + k) % t.scores.length;
    if (t.workers[next] > 0 && actions({ ...t, turn: next }).length > 0) {
      t.turn = next;
      break;
    }
  }
  if (!t.workers.some((v, p) => v > 0 && actions({ ...t, turn: p }).length > 0))
    harvest(t);
  t.message = "Ronda " + t.round + " de 6 · trabajador en espacio libre";
  return t;
}
export function automatic(s: State): State {
  const f = s.farms[s.turn],
    a = actions(s),
    value = (i: number) =>
      i === 1
        ? Math.min(s.stock[1], Math.max(0, f.family * 2 - f.food)) * 3
        : i === 7
          ? (2 + f.fields * Math.max(1, f.grain)) *
            (f.food < f.family * 2 ? 3 : 1)
          : i === 5
            ? 9
            : i === 0
              ? s.stock[0] * 1.4
              : i === 3
                ? (7 - s.round) * 1.5
                : i === 2
                  ? f.grain
                    ? 1
                    : 5
                  : i === 4
                    ? s.stock[4] * (f.oven ? 2 : 1)
                    : 6;
  return a.length
    ? apply(
        s,
        a.sort((a, b) => value(Number(b.key)) - value(Number(a.key)))[0].key,
      )
    : s;
}
export function view(s: State) {
  return {
    cards: s.farms.map((f, i) => ({
      key: String(i),
      label:
        "J" +
        (i + 1) +
        " · comida " +
        f.food +
        " · madera " +
        f.wood +
        " · grano " +
        f.grain +
        " · ovejas " +
        f.sheep,
      icon: "⌂",
    })),
    notes: [
      "Ronda " +
        s.round +
        "/6. Trabajadores restantes: " +
        s.workers.join(" / "),
      "Al final de ronda: cosecha, reproducción y alimentación (2 por familiar). Cada comida ausente resta 3 PV.",
      "Familia nueva trabaja desde la ronda siguiente. Los espacios ocupados no se repiten hasta la cosecha.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: spaces.map((label, i) => ({
      key: String(i),
      label,
      symbol: ["♣", "≈", "❧", "▥", "♧", "⌂", "♨", "☀"][i],
      detail: s.used.includes(i)
        ? "Ocupado"
        : s.stock[i]
          ? s.stock[i] + " acumulados"
          : "Libre",
      action: actions(s).some((a) => a.key === String(i))
        ? String(i)
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
