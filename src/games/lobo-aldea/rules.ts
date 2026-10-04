import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export type Role = "Lobo" | "Vidente" | "Sanador" | "Aldeano";
export interface State extends DeductionPosition {
  roles: Role[];
  alive: boolean[];
  phase: "wolves" | "heal" | "see" | "vote";
  nightVotes: number[];
  dayVotes: number[];
  target: number;
  protected: number;
  lastProtected: number;
  vision: { target: number; wolf: boolean }[][];
  day: number;
  journal: string[];
}
export function initial(n: number): State {
  n = [6, 7, 8].includes(n) ? n : 6;
  const roles = shuffle([
    "Lobo",
    "Lobo",
    "Vidente",
    "Sanador",
    ...Array(n - 4).fill("Aldeano"),
  ] as Role[]);
  return {
    turn: roles.indexOf("Lobo"),
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Lobo: elige víctima nocturna",
    roles,
    alive: Array(n).fill(true),
    phase: "wolves",
    nightVotes: Array(n).fill(-1),
    dayVotes: Array(n).fill(-1),
    target: -1,
    protected: -1,
    lastProtected: -1,
    vision: Array.from({ length: n }, () => []),
    day: 1,
    journal: [],
  };
}
export function check(t: State): boolean {
  const wolves = t.roles.filter((r, i) => r === "Lobo" && t.alive[i]).length,
    others = t.alive.filter(Boolean).length - wolves;
  if (wolves === 0 || wolves >= others) {
    const bad = wolves > 0;
    t.winner = t.roles.findIndex((r) => (r === "Lobo") === bad);
    t.scores = t.roles.map((r) => ((r === "Lobo") === bad ? 1 : 0));
    t.outcome = bad ? "Ganan los lobos" : "Gana la aldea";
    t.journal.push(t.roles.map((r, i) => "J" + (i + 1) + ": " + r).join(" · "));
    return true;
  }
  return false;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  return s.alive.flatMap((live, i) =>
    live &&
    (s.phase === "heal" ? i !== s.lastProtected : i !== s.turn) &&
    (s.phase !== "wolves" || s.roles[i] !== "Lobo")
      ? [
          {
            key: String(i),
            label:
              (s.phase === "wolves"
                ? "Atacar "
                : s.phase === "heal"
                  ? "Proteger "
                  : s.phase === "see"
                    ? "Investigar "
                    : "Votar a ") +
              "J" +
              (i + 1),
          },
        ]
      : [],
  );
}
function dawn(t: State) {
  if (t.target !== t.protected && t.target >= 0) {
    t.alive[t.target] = false;
    t.journal.push(
      "Noche " +
        t.day +
        ": eliminado J" +
        (t.target + 1) +
        " (" +
        t.roles[t.target] +
        ")",
    );
  } else t.journal.push("Noche " + t.day + ": nadie muere");
  if (check(t)) return;
  t.phase = "vote";
  t.turn = t.alive.indexOf(true);
  t.dayVotes.fill(-1);
  t.message = "Aldea: vota a una persona viva";
}
function afterHeal(t: State) {
  const seer = t.roles.findIndex((r, i) => r === "Vidente" && t.alive[i]);
  if (seer >= 0) {
    t.phase = "see";
    t.turn = seer;
    t.message = "Vidente: examina un papel";
  } else dawn(t);
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    target = Number(key);
  t.step++;
  if (t.phase === "wolves") {
    t.nightVotes[p] = target;
    const pending = t.roles.findIndex(
      (r, i) => r === "Lobo" && t.alive[i] && t.nightVotes[i] < 0,
    );
    if (pending >= 0) {
      t.turn = pending;
      return t;
    }
    const votes = t.nightVotes.filter((v) => v >= 0),
      counts = votes.map((v) => ({
        v,
        c: votes.filter((x) => x === v).length,
      }));
    t.target = counts.sort((a, b) => b.c - a.c || a.v - b.v)[0].v;
    const healer = t.roles.findIndex((r, i) => r === "Sanador" && t.alive[i]);
    if (healer >= 0) {
      t.phase = "heal";
      t.turn = healer;
      t.message = "Sanador: protege a alguien distinto de la noche anterior";
    } else {
      t.protected = -1;
      afterHeal(t);
    }
  } else if (t.phase === "heal") {
    t.protected = target;
    t.lastProtected = target;
    afterHeal(t);
  } else if (t.phase === "see") {
    t.vision[p].push({ target, wolf: t.roles[target] === "Lobo" });
    dawn(t);
  } else {
    t.dayVotes[p] = target;
    const pending = t.alive.findIndex((live, i) => live && t.dayVotes[i] < 0);
    if (pending >= 0) t.turn = pending;
    else {
      const counts = t.alive
        .flatMap((live, i) =>
          live ? [{ i, v: t.dayVotes.filter((v) => v === i).length }] : [],
        )
        .sort((a, b) => b.v - a.v);
      t.journal.push(
        "Día " +
          t.day +
          " votos: " +
          t.dayVotes
            .map((v, i) => (t.alive[i] ? "J" + (i + 1) + "→J" + (v + 1) : "—"))
            .join(", "),
      );
      if (counts[0].v > (counts[1]?.v || 0)) {
        t.alive[counts[0].i] = false;
        t.journal.push(
          "Expulsado J" + (counts[0].i + 1) + " (" + t.roles[counts[0].i] + ")",
        );
      } else t.journal.push("Empate: nadie expulsado");
      if (check(t)) return t;
      if (t.day === 12) {
        t.winner = -1;
        t.outcome = "Empate por límite de doce días";
        return t;
      }
      t.day++;
      t.nightVotes.fill(-1);
      t.phase = "wolves";
      t.turn = t.roles.findIndex((r, i) => r === "Lobo" && t.alive[i]);
      t.message = "Lobo: elige víctima nocturna";
    }
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s);
  if (s.phase === "vote" && s.roles[s.turn] === "Vidente") {
    const known = s.vision[s.turn].filter((v) => v.wolf && s.alive[v.target]);
    if (known.length && a.some((a) => a.key === String(known[0].target)))
      return apply(s, String(known[0].target));
  }
  if (s.phase === "see") {
    const unseen = a.filter(
      (a) => !s.vision[s.turn].some((v) => v.target === Number(a.key)),
    );
    return apply(s, pick(unseen.length ? unseen : a).key);
  }
  return a.length ? apply(s, pick(a).key) : s;
}
export function view(s: State) {
  const p = s.turn;
  return {
    private:
      s.winner === null
        ? "Tu papel: " +
          s.roles[p] +
          (s.roles[p] === "Lobo"
            ? " · Lobos: " +
              s.roles
                .flatMap((r, i) => (r === "Lobo" ? ["J" + (i + 1)] : []))
                .join(", ")
            : s.roles[p] === "Vidente"
              ? " · Investigaciones: " +
                s.vision[p]
                  .map(
                    (v) =>
                      "J" +
                      (v.target + 1) +
                      (v.wolf ? " es lobo" : " no es lobo"),
                  )
                  .join("; ")
              : "")
        : undefined,
    cards: [],
    notes: [
      "Día " + s.day + "/12 · vivos " + s.alive.filter(Boolean).length,
      ...s.journal.slice(-7),
      "Variante Games: dos lobos, vidente y sanador, sin moderador. Hablad entre turnos; la interfaz no genera conversaciones ni acusaciones sociales.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 4,
    cells: s.alive.map((live, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: live ? "⌂" : "×",
      detail: live ? "Vivo" : s.roles[i],
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
