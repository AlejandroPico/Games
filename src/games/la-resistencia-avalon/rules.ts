import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export type Role = "Merlín" | "Asesino" | "Esbirro" | "Leal";
export interface State extends DeductionPosition {
  roles: Role[];
  leader: number;
  phase: "team" | "vote" | "mission" | "assassinate";
  team: number[];
  votes: (boolean | null)[];
  sabotage: number;
  quest: number;
  success: number;
  fail: number;
  rejections: number;
  history: { team: number[]; failed: boolean }[];
  journal: string[];
}
export function evil(r: Role): boolean {
  return r === "Asesino" || r === "Esbirro";
}
export function knowledge(s: State, p: number): number[] {
  return s.roles[p] === "Merlín" || evil(s.roles[p])
    ? s.roles.flatMap((r, i) => (evil(r) ? [i] : []))
    : [];
}
export function initial(n: number): State {
  n = n === 6 ? 6 : 5;
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Líder: propone un equipo",
    roles: shuffle([
      "Merlín",
      "Asesino",
      "Esbirro",
      ...Array(n - 3).fill("Leal"),
    ] as Role[]),
    leader: 0,
    phase: "team",
    team: [],
    votes: Array(n).fill(null),
    sabotage: 0,
    quest: 0,
    success: 0,
    fail: 0,
    rejections: 0,
    history: [],
    journal: [],
  };
}
function end(t: State, bad: boolean) {
  t.scores = t.roles.map((r) => (evil(r) === bad ? 1 : 0));
  t.winner = t.roles.findIndex((r) => evil(r) === bad);
  t.outcome =
    (bad ? "Gana el Mal" : "Gana el Bien") +
    " · " +
    t.roles
      .flatMap((r, i) => (evil(r) === bad ? ["J" + (i + 1)] : []))
      .join(", ");
  t.journal.push(t.roles.map((r, i) => "J" + (i + 1) + ": " + r).join(" · "));
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "team") {
    const count = (s.roles.length === 5 ? [2, 3, 2, 3, 3] : [2, 3, 4, 3, 4])[
        s.quest
      ],
      teams: number[][] = [];
    const combinations = (start: number, team: number[]) => {
      if (team.length === count) {
        teams.push(team);
        return;
      }
      for (let i = start; i < s.roles.length; i++)
        combinations(i + 1, [...team, i]);
    };
    combinations(0, []);
    return teams.map((t) => ({
      key: "team:" + t.join(","),
      label: "Proponer " + t.map((i) => "J" + (i + 1)).join(", "),
    }));
  }
  if (s.phase === "vote")
    return [
      { key: "yes", label: "Aprobar equipo" },
      { key: "no", label: "Rechazar equipo" },
    ];
  if (s.phase === "mission")
    return [
      { key: "success", label: "Entregar éxito" },
      ...(evil(s.roles[s.turn])
        ? [{ key: "fail", label: "Sabotear misión" }]
        : []),
    ];
  return s.roles.flatMap((_, i) =>
    i !== s.turn
      ? [{ key: "kill:" + i, label: "Acusar a J" + (i + 1) + " de ser Merlín" }]
      : [],
  );
}
function nextLeader(t: State) {
  t.leader = (t.leader + 1) % t.roles.length;
  t.turn = t.leader;
  t.phase = "team";
  t.team = [];
  t.votes.fill(null);
  t.message = "Líder: propone un equipo";
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s);
  t.step++;
  if (t.phase === "team") {
    t.team = key.split(":")[1].split(",").map(Number);
    t.phase = "vote";
    t.turn = 0;
    t.votes.fill(null);
    t.message = "Vota en secreto la propuesta del líder";
  } else if (t.phase === "vote") {
    t.votes[t.turn] = key === "yes";
    if (t.turn < t.roles.length - 1) t.turn++;
    else {
      t.journal.push(
        "Propuesta J" +
          (t.leader + 1) +
          " [" +
          t.team.map((i) => i + 1).join(",") +
          "] · votos " +
          t.votes.map((v) => (v ? "sí" : "no")).join("/"),
      );
      if (t.votes.filter(Boolean).length > t.roles.length / 2) {
        t.phase = "mission";
        t.turn = t.team[0];
        t.sabotage = 0;
        t.message = "Integrante: entrega carta secreta de misión";
      } else {
        t.rejections++;
        if (t.rejections === 5) end(t, true);
        else nextLeader(t);
      }
    }
  } else if (t.phase === "mission") {
    if (key === "fail") t.sabotage++;
    const next = t.team.indexOf(t.turn) + 1;
    if (next < t.team.length) t.turn = t.team[next];
    else {
      const failed = t.sabotage > 0;
      t.history.push({ team: [...t.team], failed });
      t.journal.push(
        "Misión " +
          (t.quest + 1) +
          ": " +
          (failed ? "fracaso" : "éxito") +
          " · " +
          t.sabotage +
          " sabotajes",
      );
      if (failed) t.fail++;
      else t.success++;
      t.quest++;
      t.rejections = 0;
      if (t.fail === 3) end(t, true);
      else if (t.success === 3) {
        t.phase = "assassinate";
        t.turn = t.roles.indexOf("Asesino");
        t.message = "Asesino: identifica a Merlín";
      } else nextLeader(t);
    }
  } else end(t, t.roles[Number(key.split(":")[1])] === "Merlín");
  return t;
}
export function automatic(s: State): State {
  const known = knowledge(s, s.turn),
    bad = evil(s.roles[s.turn]),
    suspicion = (p: number) =>
      s.history.reduce(
        (v, h) => v + (h.team.includes(p) ? (h.failed ? 1 : -0.3) : 0),
        0,
      );
  if (s.phase === "team") {
    const a = actions(s).map((a) => ({
      key: a.key,
      team: a.key.split(":")[1].split(",").map(Number),
    }));
    return apply(
      s,
      a.sort((a, b) => {
        const value = (team: number[]) =>
          team.reduce(
            (v, p) =>
              v +
              (p === s.turn ? -1 : 0) +
              (known.includes(p) ? (bad ? -2 : 10) : suspicion(p)),
            0,
          );
        return value(a.team) - value(b.team);
      })[0].key,
    );
  }
  if (s.phase === "vote") {
    const reject =
      !bad &&
      (known.some((p) => s.team.includes(p)) ||
        s.team.some((p) => suspicion(p) >= 2));
    return apply(s, reject && s.rejections < 4 ? "no" : "yes");
  }
  if (s.phase === "mission") return apply(s, bad ? "fail" : "success");
  const options = actions(s).filter(
    (a) => !known.includes(Number(a.key.split(":")[1])),
  );
  return apply(s, pick(options.length ? options : actions(s)).key);
}
export function view(s: State) {
  const known = knowledge(s, s.turn);
  return {
    private:
      s.winner === null
        ? "Tu papel: " +
          s.roles[s.turn] +
          (known.length
            ? " · Conoces al Mal: " + known.map((i) => "J" + (i + 1)).join(", ")
            : " · No conoces otros papeles")
        : undefined,
    cards: s.team.map((p) => ({
      key: String(p),
      label: "J" + (p + 1) + " propuesto",
      icon: "⚑",
    })),
    notes: [
      "Misión " +
        Math.min(5, s.quest + 1) +
        " · éxitos " +
        s.success +
        " · fracasos " +
        s.fail +
        " · rechazos " +
        s.rejections +
        "/5",
      ...s.journal.slice(-7),
      "Votos y cartas individuales permanecen ocultos hasta su resolución. La misión revela solo el total de sabotajes.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: s.roles.length === 6 ? 3 : 5,
    cells: s.roles.map((_, i) => ({
      key: String(i),
      label: "J" + (i + 1),
      symbol: s.leader === i ? "♔" : "♟",
      owner: s.team.includes(i) ? i : undefined,
      detail:
        s.phase === "vote"
          ? s.votes[i] === null
            ? "Pendiente"
            : "Voto entregado"
          : s.leader === i
            ? "Líder"
            : "Participante",
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
