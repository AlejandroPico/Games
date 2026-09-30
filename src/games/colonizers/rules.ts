export const resources = ["Madera", "Arcilla", "Lana", "Trigo", "Mineral"];
export type Hex = {
  x: number;
  y: number;
  resource: number;
  number: number;
  vertices: number[];
};
export type Vertex = { x: number; y: number; hexes: number[]; edges: number[] };
export type Island = {
  hexes: Hex[];
  vertices: Vertex[];
  edges: [number, number][];
};
function shuffle<T>(a: T[], random: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function island(random = Math.random): Island {
  const hexes: Hex[] = [],
    vertices: Vertex[] = [],
    edges: [number, number][] = [],
    types = shuffle(
      [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, -1],
      random,
    ),
    numbers = shuffle(
      [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
      random,
    );
  let t = 0;
  for (let q = -2; q <= 2; q++)
    for (let r = -2; r <= 2; r++)
      if (Math.abs(q + r) <= 2) {
        const x = Math.sqrt(3) * (q + r / 2),
          y = 1.5 * r,
          ids: number[] = [];
        for (let k = 0; k < 6; k++) {
          const angle = ((30 + 60 * k) * Math.PI) / 180,
            vx = x + Math.cos(angle),
            vy = y + Math.sin(angle);
          let i = vertices.findIndex(
            (v) => Math.abs(v.x - vx) < 0.001 && Math.abs(v.y - vy) < 0.001,
          );
          if (i < 0) {
            i = vertices.length;
            vertices.push({ x: vx, y: vy, hexes: [], edges: [] });
          }
          vertices[i].hexes.push(hexes.length);
          ids.push(i);
        }
        const resource = types[t++];
        hexes.push({
          x,
          y,
          resource,
          number: resource < 0 ? 0 : numbers.pop()!,
          vertices: ids,
        });
        for (let k = 0; k < 6; k++) {
          const pair = [ids[k], ids[(k + 1) % 6]].sort((a, b) => a - b) as [
            number,
            number,
          ];
          if (!edges.some(([a, b]) => a === pair[0] && b === pair[1])) {
            const e = edges.length;
            edges.push(pair);
            vertices[pair[0]].edges.push(e);
            vertices[pair[1]].edges.push(e);
          }
        }
      }
  return { hexes, vertices, edges };
}
export type State = {
  map: Island;
  owners: number[];
  levels: number[];
  roads: number[];
  hands: number[][];
  bank: number[];
  turn: number;
  players: number;
  phase:
    | "settlement"
    | "road"
    | "roll"
    | "discard"
    | "robber"
    | "steal"
    | "build"
    | "over";
  setup: number;
  lastVertex: number;
  robber: number;
  discarders: number[];
  victims: number[];
  dice: number[];
  longest: number;
  lengths: number[];
  winner: number;
  target: number;
  message: string;
  round: number;
};
export const setupOrder = (n: number) => [
  ...Array.from({ length: n }, (_, i) => i),
  ...Array.from({ length: n }, (_, i) => n - 1 - i),
];
export function initial(players = 3, random = Math.random): State {
  const map = island(random);
  return {
    map,
    owners: Array(map.vertices.length).fill(-1),
    levels: Array(map.vertices.length).fill(0),
    roads: Array(map.edges.length).fill(-1),
    hands: Array.from({ length: players }, () => Array(5).fill(0)),
    bank: Array(5).fill(19),
    turn: 0,
    players,
    phase: "settlement",
    setup: 0,
    lastVertex: -1,
    robber: map.hexes.findIndex((h) => h.resource < 0),
    discarders: [],
    victims: [],
    dice: [],
    longest: -1,
    lengths: Array(players).fill(0),
    winner: -1,
    target: 8,
    message: "Elige un vértice para tu poblado inicial.",
    round: 1,
  };
}
export const actor = (s: State) =>
  s.phase === "discard" ? s.discarders[0] : s.turn;
export function points(s: State, p: number) {
  return (
    s.owners.reduce((n, o, i) => n + (o === p ? s.levels[i] : 0), 0) +
    (s.longest === p ? 2 : 0)
  );
}
const enough = (hand: number[], cost: number[]) =>
  cost.every((v, i) => hand[i] >= v);
const costs = {
  road: [1, 1, 0, 0, 0],
  settlement: [1, 1, 1, 1, 0],
  city: [0, 0, 0, 2, 3],
};
function pay(s: State, cost: number[]): State {
  const hands = s.hands.map((h, p) =>
      p === s.turn ? h.map((v, i) => v - cost[i]) : [...h],
    ),
    bank = s.bank.map((v, i) => v + cost[i]);
  return { ...s, hands, bank };
}
export function distanceLegal(s: State, v: number) {
  return (
    s.owners[v] < 0 &&
    s.map.vertices[v].edges.every((e) =>
      s.map.edges[e].every((i) => i === v || s.owners[i] < 0),
    )
  );
}
export function settlements(s: State): number[] {
  if (s.phase !== "settlement" && s.phase !== "build") return [];
  if (
    s.phase === "build" &&
    (!enough(s.hands[s.turn], costs.settlement) ||
      s.owners.filter((o, i) => o === s.turn && s.levels[i] === 1).length >= 5)
  )
    return [];
  return s.map.vertices.flatMap((v, i) =>
    distanceLegal(s, i) &&
    (s.phase === "settlement" || v.edges.some((e) => s.roads[e] === s.turn))
      ? [i]
      : [],
  );
}
export function roads(s: State): number[] {
  if (s.phase !== "road" && s.phase !== "build") return [];
  if (
    s.phase === "build" &&
    (!enough(s.hands[s.turn], costs.road) ||
      s.roads.filter((p) => p === s.turn).length >= 15)
  )
    return [];
  return s.map.edges.flatMap(([a, b], e) =>
    s.roads[e] < 0 &&
    (s.phase === "road"
      ? a === s.lastVertex || b === s.lastVertex
      : [a, b].some(
          (v) =>
            s.owners[v] === s.turn ||
            (s.owners[v] < 0 &&
              s.map.vertices[v].edges.some((i) => s.roads[i] === s.turn)),
        ))
      ? [e]
      : [],
  );
}
export function cities(s: State): number[] {
  return s.phase === "build" &&
    enough(s.hands[s.turn], costs.city) &&
    s.owners.filter((o, i) => o === s.turn && s.levels[i] === 2).length < 4
    ? s.owners.flatMap((o, i) => (o === s.turn && s.levels[i] === 1 ? [i] : []))
    : [];
}
export function longestRoad(s: State, p: number): number {
  let best = 0;
  const edges = s.roads.flatMap((o, e) => (o === p ? [e] : []));
  function visit(v: number, used: Set<number>) {
    best = Math.max(best, used.size);
    if (used.size && s.owners[v] >= 0 && s.owners[v] !== p) return;
    for (const e of s.map.vertices[v].edges)
      if (s.roads[e] === p && !used.has(e)) {
        const next = new Set(used);
        next.add(e);
        visit(s.map.edges[e].find((x) => x !== v)!, next);
      }
  }
  for (const e of edges) for (const v of s.map.edges[e]) visit(v, new Set());
  return best;
}
function update(s: State): State {
  const lengths = Array.from({ length: s.players }, (_, p) =>
      longestRoad(s, p),
    ),
    max = Math.max(...lengths),
    ties = lengths.flatMap((n, p) => (n === max ? [p] : [])),
    longest =
      max < 5
        ? -1
        : ties.includes(s.longest)
          ? s.longest
          : ties.length === 1
            ? ties[0]
            : -1;
  const n = { ...s, lengths, longest };
  return s.phase === "build" && points(n, s.turn) >= s.target
    ? {
        ...n,
        phase: "over",
        winner: s.turn,
        message: "Victoria con " + points(n, s.turn) + " puntos.",
      }
    : n;
}
export function build(
  s: State,
  type: "settlement" | "road" | "city",
  i: number,
): State | null {
  if (type === "road") {
    if (!roads(s).includes(i)) return null;
    const rr = [...s.roads];
    rr[i] = s.turn;
    if (s.phase === "road") {
      const setup = s.setup + 1,
        done = setup === s.players * 2;
      return {
        ...s,
        roads: rr,
        setup,
        turn: done ? 0 : setupOrder(s.players)[setup],
        phase: done ? "roll" : "settlement",
        message: done
          ? "Lanza los dados para producir recursos."
          : "Elige el siguiente poblado.",
      };
    }
    return update({
      ...pay(s, costs.road),
      roads: rr,
      message: "Camino construido.",
    });
  }
  const options = type === "city" ? cities(s) : settlements(s);
  if (!options.includes(i)) return null;
  const owners = [...s.owners],
    levels = [...s.levels];
  owners[i] = s.turn;
  levels[i] = type === "city" ? 2 : 1;
  if (s.phase === "settlement") {
    const hands = s.hands.map((h) => [...h]),
      bank = [...s.bank];
    if (s.setup >= s.players)
      for (const hex of s.map.vertices[i].hexes) {
        const r = s.map.hexes[hex].resource;
        if (r >= 0 && bank[r]) {
          hands[s.turn][r]++;
          bank[r]--;
        }
      }
    return {
      ...s,
      owners,
      levels,
      hands,
      bank,
      phase: "road",
      lastVertex: i,
      message: "Construye un camino junto al poblado.",
    };
  }
  return update({
    ...pay(s, costs[type]),
    owners,
    levels,
    message:
      type === "city"
        ? "Ciudad construida: produce el doble."
        : "Poblado construido.",
  });
}
export function roll(s: State, random = Math.random): State | null {
  if (s.phase !== "roll") return null;
  if (points(s, s.turn) >= s.target)
    return { ...s, phase: "over", winner: s.turn };
  const dice = [1 + Math.floor(random() * 6), 1 + Math.floor(random() * 6)],
    sum = dice[0] + dice[1];
  if (sum === 7) {
    const discarders = s.hands.flatMap((h, p) =>
      h.reduce((n, v) => n + v, 0) > 7 ? [p] : [],
    );
    return {
      ...s,
      dice,
      discarders,
      phase: discarders.length ? "discard" : "robber",
      message:
        "Siete: descarta la mitad si tienes más de siete y mueve el ladrón.",
    };
  }
  const demands = Array.from({ length: s.players }, () => Array(5).fill(0)),
    hands = s.hands.map((h) => [...h]),
    bank = [...s.bank];
  s.map.hexes.forEach((h, i) => {
    if (i === s.robber || h.number !== sum || h.resource < 0) return;
    h.vertices.forEach((v) => {
      const owner = s.owners[v];
      if (owner >= 0) demands[owner][h.resource] += s.levels[v];
    });
  });
  for (let r = 0; r < 5; r++) {
    const total = demands.reduce((n, d) => n + d[r], 0);
    if (total <= bank[r]) {
      bank[r] -= total;
      demands.forEach((d, p) => (hands[p][r] += d[r]));
    }
  }
  return {
    ...s,
    hands,
    bank,
    dice,
    phase: "build",
    message: "Producción " + sum + " · comercia o construye.",
  };
}
export function discard(s: State, cards: number[]): State | null {
  if (s.phase !== "discard" || cards.length !== 5) return null;
  const p = s.discarders[0],
    need = Math.floor(s.hands[p].reduce((n, v) => n + v, 0) / 2);
  if (
    cards.some((n, i) => !Number.isInteger(n) || n < 0 || n > s.hands[p][i]) ||
    cards.reduce((n, v) => n + v, 0) !== need
  )
    return null;
  const hands = s.hands.map((h, i) =>
      i === p ? h.map((n, r) => n - cards[r]) : h,
    ),
    bank = s.bank.map((n, r) => n + cards[r]),
    discarders = s.discarders.slice(1);
  return {
    ...s,
    hands,
    bank,
    discarders,
    phase: discarders.length ? "discard" : "robber",
  };
}
export function moveRobber(s: State, i: number): State | null {
  if (s.phase !== "robber" || !s.map.hexes[i] || i === s.robber) return null;
  const victims = [
    ...new Set(s.map.hexes[i].vertices.map((v) => s.owners[v])),
  ].filter((p) => p >= 0 && p !== s.turn && s.hands[p].some(Boolean));
  return {
    ...s,
    robber: i,
    victims,
    phase: victims.length ? "steal" : "build",
    message: victims.length
      ? "Elige a quién robar una carta."
      : "El ladrón bloquea esta región.",
  };
}
export function steal(s: State, p: number, random = Math.random): State | null {
  if (s.phase !== "steal" || !s.victims.includes(p)) return null;
  const hand = s.hands[p],
    cards = hand.flatMap((n, r) => Array<number>(n).fill(r));
  if (!cards.length) return null;
  const r = cards[Math.floor(random() * cards.length)],
    hands = s.hands.map((h) => [...h]);
  hands[p][r]--;
  hands[s.turn][r]++;
  return {
    ...s,
    hands,
    phase: "build",
    victims: [],
    message: "Carta robada · puedes construir.",
  };
}
export function trade(s: State, give: number, take: number): State | null {
  if (
    s.phase !== "build" ||
    give === take ||
    give < 0 ||
    give > 4 ||
    take < 0 ||
    take > 4 ||
    s.hands[s.turn][give] < 4 ||
    !s.bank[take]
  )
    return null;
  const hands = s.hands.map((h) => [...h]),
    bank = [...s.bank];
  hands[s.turn][give] -= 4;
  hands[s.turn][take]++;
  bank[give] += 4;
  bank[take]--;
  return { ...s, hands, bank, message: "Intercambio 4 por 1 con el banco." };
}
export function endTurn(s: State): State | null {
  if (s.phase !== "build") return null;
  const turn = (s.turn + 1) % s.players;
  return {
    ...s,
    turn,
    phase: points(s, turn) >= s.target ? "over" : "roll",
    winner: points(s, turn) >= s.target ? turn : -1,
    round: s.round + (turn === 0 ? 1 : 0),
    message: "Lanza los dados.",
  };
}
export function production(s: State, v: number) {
  return s.map.vertices[v].hexes.reduce(
    (n, i) =>
      n + (s.map.hexes[i].number ? 6 - Math.abs(7 - s.map.hexes[i].number) : 0),
    0,
  );
}
export function aiDiscard(s: State) {
  const hand = [...s.hands[actor(s)]],
    cards = Array(5).fill(0),
    need = Math.floor(hand.reduce((n, v) => n + v, 0) / 2);
  for (let k = 0; k < need; k++) {
    const r = hand.indexOf(Math.max(...hand));
    cards[r]++;
    hand[r]--;
  }
  return cards;
}
export function roadTowardSettlement(s: State): number | null {
  const candidates = roads(s);
  if (!candidates.length) return null;
  let best = -Infinity,
    chosen: number | null = null;
  for (const first of candidates) {
    const dist = Array(s.map.vertices.length).fill(Infinity),
      firstEdges = [...s.roads];
    firstEdges[first] = s.turn;
    for (let i = 0; i < dist.length; i++)
      if (
        s.owners[i] === s.turn ||
        s.map.vertices[i].edges.some((e) => firstEdges[e] === s.turn)
      )
        dist[i] = 0;
    const seen = new Set<number>();
    for (let k = 0; k < dist.length; k++) {
      let v = -1;
      for (let i = 0; i < dist.length; i++)
        if (!seen.has(i) && (v < 0 || dist[i] < dist[v])) v = i;
      if (v < 0 || !Number.isFinite(dist[v])) break;
      seen.add(v);
      if (s.owners[v] >= 0 && s.owners[v] !== s.turn) continue;
      for (const e of s.map.vertices[v].edges)
        if (firstEdges[e] < 0 || firstEdges[e] === s.turn) {
          const to = s.map.edges[e].find((i) => i !== v)!;
          dist[to] = Math.min(
            dist[to],
            dist[v] + (firstEdges[e] === s.turn ? 0 : 1),
          );
        }
    }
    const score = Math.max(
      ...dist.map((d, v) =>
        distanceLegal(s, v) ? production(s, v) * 3 - d * 9 : -1000,
      ),
    );
    if (score > best) {
      best = score;
      chosen = first;
    }
  }
  return chosen;
}
export function aiAction(s: State, random = Math.random): State {
  if (s.phase === "settlement") {
    const v = settlements(s).sort(
      (a, b) => production(s, b) - production(s, a),
    )[0];
    return v === undefined ? s : build(s, "settlement", v) || s;
  }
  if (s.phase === "road") {
    const e = roads(s).sort(
      (a, b) =>
        Math.max(...s.map.edges[b].map((v) => production(s, v))) -
        Math.max(...s.map.edges[a].map((v) => production(s, v))),
    )[0];
    return e === undefined ? s : build(s, "road", e) || s;
  }
  if (s.phase === "roll") return roll(s, random) || s;
  if (s.phase === "discard") return discard(s, aiDiscard(s)) || s;
  if (s.phase === "robber") {
    const candidates = s.map.hexes
      .map((h, i) => ({
        i,
        score: h.vertices.reduce(
          (n, v) =>
            n +
            (s.owners[v] < 0
              ? 0
              : s.owners[v] === s.turn
                ? -20
                : s.levels[v] * production(s, v)),
          0,
        ),
      }))
      .filter((h) => h.i !== s.robber)
      .sort((a, b) => b.score - a.score);
    return moveRobber(s, candidates[0].i) || s;
  }
  if (s.phase === "steal")
    return (
      steal(
        s,
        [...s.victims].sort(
          (a, b) =>
            s.hands[b].reduce((n, v) => n + v, 0) -
            s.hands[a].reduce((n, v) => n + v, 0),
        )[0],
        random,
      ) || s
    );
  if (s.phase !== "build") return s;
  const city = cities(s).sort((a, b) => production(s, b) - production(s, a))[0];
  if (city !== undefined) return build(s, "city", city) || s;
  const town = settlements(s).sort(
    (a, b) => production(s, b) - production(s, a),
  )[0];
  if (town !== undefined) return build(s, "settlement", town) || s;
  const goals = s.owners.some((p, i) => p === s.turn && s.levels[i] === 1)
      ? costs.city
      : costs.settlement,
    hand = s.hands[s.turn];
  for (let take = 0; take < 5; take++)
    if (hand[take] < goals[take] && s.bank[take]) {
      const give = hand.findIndex((v, r) => r !== take && v >= 4 + goals[r]);
      if (give >= 0) return trade(s, give, take) || s;
    }
  const road = roadTowardSettlement(s);
  if (road !== null) return build(s, "road", road) || s;
  return endTurn(s) || s;
}
