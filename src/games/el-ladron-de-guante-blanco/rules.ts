import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  roles: boolean[];
  hands: number[][];
  vaults: number[];
  alarms: number[];
  loot: number[];
  round: number;
}
const names = ["Ganzúa", "Cámara", "Disfraz", "Registro", "Botín doble"];
export function initial(n: number): State {
  const roles = shuffle(Array.from({ length: n }, (_, i) => i === 0));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Juega una carta de tu operación",
    roles,
    hands: Array.from({ length: n }, () =>
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 5)),
    ),
    vaults: [8, 10, 12],
    alarms: [0, 0, 0],
    loot: Array(n).fill(0),
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.hands[s.turn].flatMap((c, i) =>
    c === 3
      ? s.hands.flatMap((_, p) =>
          p !== s.turn
            ? [
                {
                  key: "inspect:" + i + "," + p,
                  label: "Registrar J" + (p + 1),
                },
              ]
            : [],
        )
      : s.vaults.flatMap((v, k) =>
          v > 0 || c === 1 || c === 2
            ? [
                {
                  key: "vault:" + i + "," + k,
                  label: names[c] + " en cámara " + (k + 1),
                },
              ]
            : [],
        ),
  );
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [a, raw] = key.split(":"),
    [i, k] = raw.split(",").map(Number),
    c = t.hands[p].splice(i, 1)[0];
  if (a === "inspect") {
    const found = t.loot[k] > 0,
      confiscate = Math.min(3, t.loot[k]);
    t.loot[k] -= confiscate;
    t.scores[p] += found ? 2 : 0;
    t.message =
      "Registro J" +
      (k + 1) +
      ": " +
      (found ? confiscate + " botines recuperados" : "sin botín");
  } else if (c === 1) {
    t.alarms[k] = Math.min(5, t.alarms[k] + 2);
    t.scores[p]++;
  } else if (c === 2) t.alarms[k] = Math.max(0, t.alarms[k] - 2);
  else {
    const steal = Math.min(t.vaults[k], c === 4 ? 3 : 2),
      roll = 1 + Math.floor(Math.random() * 6);
    if (roll > t.alarms[k]) {
      t.vaults[k] -= steal;
      t.loot[p] += steal;
      t.message = "Golpe logrado: " + steal + " botines";
    } else {
      t.scores[p]--;
      t.message = "Alarma: golpe frustrado";
    }
    t.alarms[k] = Math.min(5, t.alarms[k] + 1);
  }
  t.hands[p].push(Math.floor(Math.random() * 5));
  t.step++;
  t.turn = (p + 1) % t.scores.length;
  if (t.turn === 0) t.round++;
  if (t.round > 12 || t.vaults.every((v) => v === 0)) {
    t.scores = t.scores.map((v, i) => v + t.loot[i] * (t.roles[i] ? 2 : 1));
    t.winner = champion(t.scores);
    t.outcome =
      (t.winner < 0 ? "Empate" : "Gana J" + (t.winner + 1)) +
      " · ladrón secreto " +
      (t.roles.indexOf(true) + 1);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    p = s.turn,
    value = (key: string) => {
      const [kind, raw] = key.split(":"),
        [i, k] = raw.split(",").map(Number),
        c = s.hands[p][i];
      return kind === "inspect"
        ? s.loot[k] >= 2
          ? 2
          : 0
        : c === 1
          ? 1
          : c === 2
            ? s.alarms[k] - 1
            : ((s.roles[p] ? 2 : 1) * (c === 4 ? 3 : 2) * (6 - s.alarms[k])) /
              6;
    };
  return apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    private:
      "Tu identidad: " +
      (s.roles[s.turn]
        ? "Ladrón de guante blanco: botín vale doble"
        : "Operador: botín vale uno"),
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c],
      icon: ["⌕", "◉", "♟", "▤", "◆"][c],
    })),
    notes: [
      "Ronda " + s.round + "/12 · botín público " + s.loot.join("/"),
      "Ganzúa roba 2, Botín doble roba 3, Cámara sube alarma 2 y da un punto, Disfraz baja alarma 2, Registro confisca hasta 3 y da 2 PV si encuentra algo.",
      "Golpe: dado de seis debe superar alarma. Todas las identidades son independientes; solo una puntúa doble por botín. Edición original.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 3,
    cells: s.vaults.map((v, i) => ({
      key: String(i),
      label: "Cámara " + (i + 1),
      symbol: "◇",
      detail: v + " botín · alarma " + s.alarms[i],
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
