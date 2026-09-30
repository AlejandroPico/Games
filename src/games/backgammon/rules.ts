export type State = {
  points: number[];
  bar: number[];
  off: number[];
  turn: number;
  dice: number[];
  phase: "opening" | "roll" | "move" | "double" | "over";
  cube: number;
  owner: number;
  winner: number;
  award: number;
  message: string;
};
export type Move = { from: number; to: number; die: number };
export function initial(): State {
  const points = Array(24).fill(0);
  for (const [i, n] of [
    [23, 2],
    [12, 5],
    [7, 3],
    [5, 5],
    [0, -2],
    [11, -5],
    [16, -3],
    [18, -5],
  ])
    points[i] = n;
  return {
    points,
    bar: [0, 0],
    off: [0, 0],
    turn: 1,
    dice: [],
    phase: "opening",
    cube: 1,
    owner: 0,
    winner: 0,
    award: 0,
    message: "Cada bando lanza un dado; empieza el mayor.",
  };
}
const sign = (p: number) => (p === 1 ? 1 : -1);
export function singleMoves(s: State, die: number): Move[] {
  const p = s.turn,
    sg = sign(p),
    dir = p === 1 ? -1 : 1,
    sources = s.bar[p - 1]
      ? [-1]
      : s.points.flatMap((v, i) => (v * sg > 0 ? [i] : [])),
    allHome =
      !s.bar[p - 1] &&
      s.points.every((v, i) => v * sg <= 0 || (p === 1 ? i <= 5 : i >= 18));
  const moves: Move[] = [];
  for (const from of sources) {
    const to = from === -1 ? (p === 1 ? 24 - die : die - 1) : from + dir * die;
    if (to >= 0 && to < 24) {
      if (s.points[to] * sg >= -1) moves.push({ from, to, die });
    } else if (from !== -1 && allHome) {
      const distance = p === 1 ? from + 1 : 24 - from,
        farther = s.points.some(
          (v, i) => v * sg > 0 && (p === 1 ? i > from : i < from),
        );
      if (die === distance || (die > distance && !farther))
        moves.push({ from, to: 24, die });
    }
  }
  return moves;
}
function rawMove(s: State, m: Move): State {
  const points = [...s.points],
    bar = [...s.bar],
    off = [...s.off],
    p = s.turn,
    sg = sign(p);
  if (m.from === -1) bar[p - 1]--;
  else points[m.from] -= sg;
  if (m.to === 24) off[p - 1]++;
  else {
    if (points[m.to] === -sg) {
      points[m.to] = 0;
      bar[2 - p]++;
    }
    points[m.to] += sg;
  }
  const dice = [...s.dice];
  dice.splice(dice.indexOf(m.die), 1);
  return { ...s, points, bar, off, dice };
}
/** Enumerate complete turns, then enforce maximum dice usage and the higher die rule. */
export function turns(s: State): Move[][] {
  if (s.phase !== "move") return [];
  const paths: Move[][] = [];
  function visit(p: State, path: Move[]) {
    let found = false;
    for (const die of new Set(p.dice))
      for (const m of singleMoves(p, die)) {
        found = true;
        visit(rawMove(p, m), [...path, m]);
      }
    if (!found) paths.push(path);
  }
  visit(s, []);
  const max = Math.max(0, ...paths.map((p) => p.length));
  let result = paths.filter((p) => p.length === max);
  if (max === 1 && s.dice.length === 2 && s.dice[0] !== s.dice[1]) {
    const highest = Math.max(...result.map((p) => p[0].die));
    result = result.filter((p) => p[0].die === highest);
  }
  return result;
}
export function legalMoves(s: State): Move[] {
  const all = turns(s).flatMap((p) => (p.length ? [p[0]] : []));
  return all.filter(
    (m, i) =>
      all.findIndex(
        (x) => x.from === m.from && x.to === m.to && x.die === m.die,
      ) === i,
  );
}
function victory(s: State, winner: number): State {
  const loser = 3 - winner,
    back =
      s.bar[loser - 1] > 0 ||
      s.points.some(
        (v, i) => v * sign(loser) > 0 && (winner === 1 ? i <= 5 : i >= 18),
      ),
    mult = s.off[loser - 1] > 0 ? 1 : back ? 3 : 2;
  return {
    ...s,
    phase: "over",
    winner,
    award: s.cube * mult,
    message:
      (mult === 3 ? "Backgammon" : mult === 2 ? "Gammon" : "Victoria") +
      " · " +
      s.cube * mult +
      " puntos",
  };
}
export function play(s: State, m: Move): State | null {
  if (
    !legalMoves(s).some(
      (x) => x.from === m.from && x.to === m.to && x.die === m.die,
    )
  )
    return null;
  const n = rawMove(s, m);
  if (n.off[s.turn - 1] === 15) return victory(n, s.turn);
  if (!legalMoves(n).length)
    return {
      ...n,
      turn: 3 - s.turn,
      dice: [],
      phase: "roll",
      message: "Lanza los dados.",
    };
  return n;
}
export function roll(s: State, random = Math.random): State | null {
  if (s.phase !== "opening" && s.phase !== "roll") return null;
  const a = 1 + Math.floor(random() * 6),
    b = 1 + Math.floor(random() * 6);
  if (s.phase === "opening" && a === b)
    return { ...s, message: "Empate " + a + "–" + b + ". Vuelve a lanzar." };
  const n: State = {
    ...s,
    phase: "move",
    turn: s.phase === "opening" ? (a > b ? 1 : 2) : s.turn,
    dice: a === b ? [a, a, a, a] : [a, b],
    message: "Usa ambos dados si es posible.",
  };
  return legalMoves(n).length
    ? n
    : {
        ...n,
        phase: "roll",
        turn: 3 - n.turn,
        dice: [],
        message: "Sin movimientos: el turno pasa.",
      };
}
export function offerDouble(s: State): State | null {
  return s.phase === "roll" &&
    (s.owner === 0 || s.owner === s.turn) &&
    s.cube < 64
    ? {
        ...s,
        phase: "double",
        message: "Jugador " + s.turn + " propone doblar a " + s.cube * 2,
      }
    : null;
}
export function acceptDouble(s: State, accept: boolean): State | null {
  if (s.phase !== "double") return null;
  return accept
    ? {
        ...s,
        phase: "roll",
        cube: s.cube * 2,
        owner: 3 - s.turn,
        message: "Doblamiento aceptado.",
      }
    : {
        ...s,
        phase: "over",
        winner: s.turn,
        award: s.cube,
        message: "Doblamiento rechazado · " + s.cube + " puntos",
      };
}
export function pips(s: State, p: number) {
  return (
    s.bar[p - 1] * 25 +
    s.points.reduce(
      (n, v, i) =>
        n + (v * sign(p) > 0 ? Math.abs(v) * (p === 1 ? i + 1 : 24 - i) : 0),
      0,
    )
  );
}
function value(s: State, p: number) {
  const sg = sign(p);
  return (
    s.off[p - 1] * 100 -
    s.bar[p - 1] * 45 +
    s.bar[2 - p] * 35 -
    pips(s, p) * 1.2 +
    s.points.reduce((n, v) => n + (v * sg >= 2 ? 7 : v === sg ? -9 : 0), 0)
  );
}
export function bestMove(s: State): Move | null {
  let best = -Infinity,
    chosen: Move | null = null;
  for (const path of turns(s)) {
    let n = s;
    for (const m of path) n = rawMove(n, m);
    const score = value(n, s.turn);
    if (path.length && score > best) {
      best = score;
      chosen = path[0];
    }
  }
  return chosen;
}
