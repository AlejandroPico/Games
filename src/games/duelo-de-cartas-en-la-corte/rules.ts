import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  deck: number[];
  alive: boolean[];
  protected: boolean[];
  round: number;
  journal: string[];
  intel: { target: number; card: number }[][];
}
const names = [
  "",
  "Guardia",
  "Espía",
  "Barón",
  "Doncella",
  "Príncipe",
  "Canciller",
  "Condesa",
  "Princesa",
];
export function initial(n: number): State {
  const deck = shuffle([1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8]);
  deck.pop();
  const hands = Array.from({ length: n }, () => [deck.pop()!]);
  hands[0].push(deck.pop()!);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Juega una carta; guarda la otra",
    hands,
    deck,
    alive: Array(n).fill(true),
    protected: Array(n).fill(false),
    round: 1,
    journal: [],
    intel: Array.from({ length: n }, () => []),
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const forced =
      s.hands[s.turn].includes(7) &&
      s.hands[s.turn].some((c) => c === 5 || c === 6),
    a: { key: string; label: string }[] = [];
  s.hands[s.turn].forEach((c, i) => {
    if (forced && c !== 7) return;
    if ([1, 2, 3, 5, 6].includes(c)) {
      const targets = s.alive.flatMap((live, p) =>
        live && !s.protected[p] && (c === 5 || p !== s.turn) ? [p] : [],
      );
      if (!targets.length)
        a.push({
          key: "play:" + i + ",-1,0",
          label: names[c] + " sin objetivo",
        });
      for (const p of targets)
        if (c === 1)
          for (let v = 2; v <= 8; v++)
            a.push({
              key: "play:" + i + "," + p + "," + v,
              label: "Guardia: J" + (p + 1) + " tiene " + names[v],
            });
        else
          a.push({
            key: "play:" + i + "," + p + ",0",
            label: names[c] + " a J" + (p + 1),
          });
    } else a.push({ key: "play:" + i + ",-1,0", label: "Jugar " + names[c] });
  });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [i, target, guess] = key.split(":")[1].split(",").map(Number),
    c = t.hands[p].splice(i, 1)[0];
  t.step++;
  if (c === 8) t.alive[p] = false;
  if (c === 4) t.protected[p] = true;
  if (target >= 0) {
    if (c === 1 && t.hands[target][0] === guess) t.alive[target] = false;
    if (c === 2) {
      t.intel[p].push({ target, card: t.hands[target][0] });
      t.journal.push("J" + (p + 1) + " consultó la mano de J" + (target + 1));
    }
    if (c === 3) {
      if (t.hands[p][0] > t.hands[target][0]) t.alive[target] = false;
      else if (t.hands[p][0] < t.hands[target][0]) t.alive[p] = false;
    }
    if (c === 5) {
      if (t.hands[target][0] === 8) t.alive[target] = false;
      else if (t.deck.length) t.hands[target] = [t.deck.pop()!];
      else t.hands[target] = [1];
    }
    if (c === 6) [t.hands[p], t.hands[target]] = [t.hands[target], t.hands[p]];
  }
  t.journal.push(
    "J" +
      (p + 1) +
      " jugó " +
      names[c] +
      (target >= 0 ? " a J" + (target + 1) : ""),
  );
  const live = t.alive.flatMap((v, i) => (v ? [i] : []));
  if (live.length === 1) t.winner = live[0];
  else if (!t.deck.length) {
    t.scores = t.hands.map((h, i) => (t.alive[i] ? h[0] || 0 : -1));
    t.winner = champion(t.scores);
  } else {
    for (let k = 1; k <= t.alive.length; k++)
      if (t.alive[(p + k) % t.alive.length]) {
        t.turn = (p + k) % t.alive.length;
        break;
      }
    t.protected[t.turn] = false;
    t.hands[t.turn].push(t.deck.pop()!);
  }
  if (t.winner !== null)
    t.scores = t.hands.map((h, i) => (t.alive[i] ? h[0] || 0 : -1));
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    value = (key: string) => {
      const [i] = key.split(":")[1].split(",").map(Number),
        c = s.hands[s.turn][i],
        kept = s.hands[s.turn].filter((_, j) => j !== i)[0];
      return c === 8 ? -100 : kept + (c === 4 ? 2 : 0);
    };
  return apply(s, a.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    private:
      "Observaciones personales: " +
      (s.intel[s.turn]
        .map((x) => "J" + (x.target + 1) + " tenía " + names[x.card])
        .join("; ") || "ninguna"),
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: c + " · " + names[c],
      icon: "♔",
    })),
    notes: [
      "Mazo " +
        s.deck.length +
        " · objetivo: permanecer y conservar el mayor rango.",
      ...s.journal.slice(-5),
      "Guardia adivina rango 2–8; Espía examina una mano (solo el actor recibe esa pista al jugar); Barón compara manos y elimina la menor; Doncella protege hasta tu turno; Príncipe descarta y reemplaza; Canciller intercambia; Condesa obligatoria con Príncipe/Canciller; descartar Princesa elimina.",
      "Edición original de una ronda. Empates de rango final se declaran tablas.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.alive.length,
    cells: s.alive.map((live, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: live ? "♔" : "×",
      detail: live ? (s.protected[i] ? "Protegido" : "En corte") : "Eliminado",
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
