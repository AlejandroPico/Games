export type State = {
  tokens: number[][];
  arrival: number[][];
  turn: number;
  players: number;
  phase: "roll" | "move" | "over";
  die: number;
  sixes: number;
  lastMoved: number | null;
  steps: number;
  bonus: boolean;
  repeat: boolean;
  winner: number | null;
  message: string;
  serial: number;
};
export const initial = (players = 4): State => ({
  tokens: Array.from({ length: players }, () => [-1, -1, -1, -1]),
  arrival: Array.from({ length: players }, () => [0, 0, 0, 0]),
  turn: 0,
  players,
  phase: "roll",
  die: 0,
  sixes: 0,
  lastMoved: null,
  steps: 0,
  bonus: false,
  repeat: false,
  winner: null,
  message: "Tira el dado",
  serial: 0,
});
export const offset = (p: number, players: number) =>
  players === 2 ? p * 34 : p * 17;
export const physical = (progress: number, p: number, players: number) =>
  progress >= 0 && progress <= 63 ? (offset(p, players) + progress) % 68 : null;
export const safe = new Set([0, 7, 12, 17, 24, 29, 34, 41, 46, 51, 58, 63]);
export function occupants(s: State, cell: number) {
  const result: { p: number; t: number }[] = [];
  s.tokens.forEach((row, p) =>
    row.forEach((v, t) => {
      if (physical(v, p, s.players) === cell) result.push({ p, t });
    }),
  );
  return result;
}
function blocked(s: State, cell: number) {
  const occ = occupants(s, cell);
  return occ.length === 2 && occ[0].p === occ[1].p;
}
function canMove(s: State, t: number) {
  const v = s.tokens[s.turn][t];
  if (v === 71) return false;
  if (v === -1) {
    if (s.bonus || s.die !== 5) return false;
    const occ = occupants(s, offset(s.turn, s.players));
    return occ.length < 2 || occ.some((o) => o.p !== s.turn);
  }
  const end = v + s.steps;
  if (end > 71) return false;
  for (let step = v + 1; step <= Math.min(end, 63); step++) {
    const cell = physical(step, s.turn, s.players)!;
    if (blocked(s, cell)) return false;
  }
  if (end <= 63 && occupants(s, physical(end, s.turn, s.players)!).length >= 2)
    return false;
  if (
    end > 63 &&
    end < 71 &&
    s.tokens[s.turn].filter((x, i) => i !== t && x === end).length >= 2
  )
    return false;
  for (let step = Math.max(v + 1, 64); step < Math.min(end, 71); step++) {
    if (s.tokens[s.turn].filter((x) => x === step).length === 2) return false;
  }
  return true;
}
export function legalMoves(s: State) {
  if (s.phase !== "move") return [];
  let choices = [0, 1, 2, 3].filter((t) => canMove(s, t));
  if (!s.bonus && s.die === 5) {
    const exits = choices.filter((t) => s.tokens[s.turn][t] === -1);
    if (exits.length) return exits;
  }
  if (!s.bonus && s.die === 6) {
    const breaking = choices.filter((t) => {
      const v = s.tokens[s.turn][t];
      const cell = physical(v, s.turn, s.players);
      return (
        (cell !== null && blocked(s, cell)) ||
        (v >= 64 &&
          v < 71 &&
          s.tokens[s.turn].filter((x) => x === v).length === 2)
      );
    });
    if (breaking.length) choices = breaking;
  }
  return choices;
}
function endTurn(s: State): State {
  return {
    ...s,
    phase: "roll",
    turn: s.repeat ? s.turn : (s.turn + 1) % s.players,
    sixes: s.repeat ? s.sixes : 0,
    lastMoved: s.repeat ? s.lastMoved : null,
    steps: 0,
    bonus: false,
    message: s.repeat ? "El 6 repite turno" : "Tira el dado",
  };
}
export function roll(s: State, die: number): State {
  if (s.phase !== "roll" || !Number.isInteger(die) || die < 1 || die > 6)
    return s;
  const sixes = die === 6 ? s.sixes + 1 : 0;
  if (sixes === 3) {
    const tokens = s.tokens.map((r) => [...r]);
    if (
      s.lastMoved !== null &&
      tokens[s.turn][s.lastMoved] >= 0 &&
      tokens[s.turn][s.lastMoved] < 64
    )
      tokens[s.turn][s.lastMoved] = -1;
    return {
      ...endTurn({ ...s, tokens, repeat: false }),
      die,
      message:
        "Tres seises: la última ficha movida vuelve a casa (si seguía en el recorrido).",
    };
  }
  const next: State = {
    ...s,
    die,
    sixes,
    steps: die === 6 && s.tokens[s.turn].every((v) => v !== -1) ? 7 : die,
    bonus: false,
    repeat: die === 6,
    phase: "move",
    message: "Elige una ficha",
  };
  return legalMoves(next).length
    ? next
    : { ...endTurn(next), message: "Sin movimientos legales" };
}
export function move(s: State, t: number): State {
  if (!legalMoves(s).includes(t)) return s;
  const tokens = s.tokens.map((r) => [...r]),
    arrival = s.arrival.map((r) => [...r]),
    v = tokens[s.turn][t],
    end = v === -1 ? 0 : v + s.steps;
  let captured = false;
  const cell = physical(end, s.turn, s.players);
  if (cell !== null) {
    const occ = occupants(s, cell).filter(
      (o) => !(o.p === s.turn && o.t === t),
    );
    let victim: { p: number; t: number } | undefined;
    if (v === -1 && occ.length === 2)
      victim = occ
        .filter((o) => o.p !== s.turn)
        .sort((a, b) => s.arrival[b.p][b.t] - s.arrival[a.p][a.t])[0];
    else if (!safe.has(cell)) victim = occ.find((o) => o.p !== s.turn);
    if (victim) {
      tokens[victim.p][victim.t] = -1;
      captured = true;
    }
  }
  tokens[s.turn][t] = end;
  arrival[s.turn][t] = s.serial + 1;
  const next: State = {
    ...s,
    tokens,
    arrival,
    serial: s.serial + 1,
    lastMoved: !s.bonus && s.die === 6 ? t : s.lastMoved,
    message: captured
      ? "Captura: cuenta 20"
      : end === 71
        ? "Meta: cuenta 10"
        : "Ficha movida",
  };
  if (tokens[s.turn].every((v) => v === 71))
    return {
      ...next,
      winner: s.turn,
      phase: "over",
      message: "Todas las fichas en meta",
    };
  if (captured || end === 71) {
    const bonus: State = {
      ...next,
      phase: "move",
      bonus: true,
      steps: captured ? 20 : 10,
    };
    return legalMoves(bonus).length ? bonus : endTurn(bonus);
  }
  return endTurn(next);
}
export function bestMove(s: State) {
  const choices = legalMoves(s);
  let best = choices[0] ?? null,
    value = -Infinity;
  for (const t of choices) {
    const next = move(s, t),
      v = s.tokens[s.turn][t],
      end = next.tokens[s.turn][t];
    let score = end === 71 ? 1000 : end - v + (v === -1 ? 45 : 0);
    const captures =
      s.tokens.flat().filter((v) => v === -1).length -
      next.tokens.flat().filter((v) => v === -1).length;
    score -= captures * 35;
    const cell = physical(end, s.turn, s.players);
    if (cell !== null && safe.has(cell)) score += 12;
    if (cell !== null && !safe.has(cell)) {
      next.tokens.forEach((row, p) => {
        if (p === s.turn) return;
        row.forEach((v) => {
          const from = physical(v, p, s.players);
          if (
            from !== null &&
            (cell - from + 68) % 68 <= 7 &&
            (cell - from + 68) % 68 > 0
          )
            score -= 12;
        });
      });
    }
    if (score > value) {
      value = score;
      best = t;
    }
  }
  return best;
}
