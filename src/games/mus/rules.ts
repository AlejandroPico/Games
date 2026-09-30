import { spanishDeck, shuffled, type Card } from "../../shared/cards";
export type Lance = "grande" | "chica" | "pares" | "juego" | "punto";
export type Bet = {
  lance: Lance;
  stake: number;
  conceded: number | null;
  skip: boolean;
};
export type State = {
  hands: Card[][];
  stock: Card[];
  muck: Card[];
  turn: number;
  mano: number;
  round: number;
  eight: boolean;
  target: number;
  scores: number[];
  phase: "mus" | "discard" | "bet" | "showdown" | "over";
  passed: number;
  discarded: number;
  lance: number;
  offer: number;
  offerTeam: number;
  previous: number;
  bets: Bet[];
  message: string;
};
export type Action = {
  type: "mus" | "cut" | "discard" | "pass" | "bid" | "want";
  indices?: number[];
  amount?: number;
};
export const team = (p: number) => p % 2;
export const cardValue = (c: Card, eight: boolean) =>
  eight ? (c.rank === 3 ? 12 : c.rank === 2 ? 1 : c.rank) : c.rank;
export function pairProfile(cs: Card[], eight: boolean): number[] {
  const counts = new Map<number, number>();
  cs.forEach((c) => {
    const v = cardValue(c, eight);
    counts.set(v, (counts.get(v) || 0) + 1);
  });
  const four = [...counts].find(([, n]) => n === 4),
    triple = [...counts].find(([, n]) => n === 3),
    pairs = [...counts]
      .filter(([, n]) => n === 2)
      .map(([v]) => v)
      .sort((a, b) => b - a);
  if (four) return [3, four[0], four[0]];
  if (pairs.length === 2) return [3, ...pairs];
  if (triple) return [2, triple[0], 0];
  if (pairs.length === 1) return [1, pairs[0], 0];
  return [0, 0, 0];
}
export const gamePoints = (cs: Card[], eight: boolean) =>
  cs.reduce((n, c) => {
    const v = cardValue(c, eight);
    return n + (v >= 10 ? 10 : v);
  }, 0);
export function profile(cs: Card[], lance: Lance, eight: boolean): number[] {
  const values = cs.map((c) => cardValue(c, eight));
  if (lance === "grande") return values.sort((a, b) => b - a);
  if (lance === "chica") return values.sort((a, b) => a - b).map((v) => -v);
  if (lance === "pares") return pairProfile(cs, eight);
  const sum = gamePoints(cs, eight);
  return lance === "punto"
    ? [sum]
    : [[33, 34, 35, 36, 37, 40, 32, 31].indexOf(sum) + 1];
}
const compare = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};
export const lances = (s: State): Lance[] => [
  "grande",
  "chica",
  "pares",
  s.hands.some((h) => gamePoints(h, s.eight) >= 31) ? "juego" : "punto",
];
export function eligible(s: State, lance: Lance): number[] {
  return Array.from({ length: 4 }, (_, j) => (s.mano + j) % 4).filter((p) =>
    lance === "pares"
      ? pairProfile(s.hands[p], s.eight)[0] > 0
      : lance === "juego"
        ? gamePoints(s.hands[p], s.eight) >= 31
        : true,
  );
}
export function bestPlayer(s: State, lance: Lance): number {
  const players = eligible(s, lance);
  return players.reduce(
    (best, p) =>
      best < 0 ||
      compare(
        profile(s.hands[p], lance, s.eight),
        profile(s.hands[best], lance, s.eight),
      ) > 0
        ? p
        : best,
    -1,
  );
}
export function bonus(s: State, lance: Lance, t: number): number {
  if (lance === "pares")
    return s.hands.reduce(
      (n, h, p) => n + (team(p) === t ? pairProfile(h, s.eight)[0] : 0),
      0,
    );
  if (lance === "juego")
    return s.hands.reduce(
      (n, h, p) =>
        n +
        (team(p) === t
          ? gamePoints(h, s.eight) === 31
            ? 3
            : gamePoints(h, s.eight) >= 31
              ? 2
              : 0
          : 0),
      0,
    );
  if (lance === "punto") return 1;
  return 0;
}
export function initial(
  eight = true,
  target = 40,
  random = Math.random,
  scores = [0, 0],
  mano = 0,
  round = 1,
): State {
  const stock = shuffled(spanishDeck(), random),
    hands = Array.from({ length: 4 }, () => stock.splice(-4));
  return {
    hands,
    stock,
    muck: [],
    turn: mano,
    mano,
    round,
    eight,
    target,
    scores: [...scores],
    phase: "mus",
    passed: 0,
    discarded: 0,
    lance: 0,
    offer: 0,
    offerTeam: -1,
    previous: 0,
    bets: [],
    message: "",
  };
}
function scoreWinner(s: State) {
  const t = s.scores.findIndex((n) => n >= s.target);
  return t < 0
    ? s
    : { ...s, phase: "over" as const, message: "Gana equipo " + (t + 1) };
}
function showdown(s: State): State {
  let n = {
    ...s,
    scores: [...s.scores],
    phase: "showdown" as const,
    message: "",
  };
  const details: string[] = [];
  for (const bet of s.bets) {
    if (bet.skip) continue;
    const p = bestPlayer(s, bet.lance);
    if (p < 0) continue;
    const t = bet.conceded === null ? team(p) : bet.conceded,
      extra = bonus(s, bet.lance, t),
      amount =
        (bet.conceded === null
          ? bet.stake ||
            (bet.lance === "grande" || bet.lance === "chica" ? 1 : 0)
          : 0) + extra;
    n.scores[t] += amount;
    details.push(bet.lance + ": equipo " + (t + 1) + " +" + amount);
    if (n.scores[t] >= s.target)
      return {
        ...n,
        phase: "over",
        message: "Gana equipo " + (t + 1) + " · " + details.join(" · "),
      };
  }
  return { ...n, message: details.join(" · ") };
}
function beginLance(s: State): State {
  if (s.lance >= 4) return showdown(s);
  const lance = lances(s)[s.lance],
    players = eligible(s, lance),
    teams = new Set(players.map(team));
  if (teams.size < 2)
    return beginLance({
      ...s,
      bets: [
        ...s.bets,
        { lance, stake: 0, conceded: null, skip: !players.length },
      ],
      lance: s.lance + 1,
    });
  return {
    ...s,
    phase: "bet",
    turn: players[0],
    offer: 0,
    offerTeam: -1,
    previous: 0,
    passed: 0,
    message: "",
  };
}
function finishBet(s: State, bet: Bet) {
  return beginLance({ ...s, bets: [...s.bets, bet], lance: s.lance + 1 });
}
export function act(s: State, a: Action, random = Math.random): State | null {
  if (s.phase === "over" || s.phase === "showdown") return null;
  if (s.phase === "mus") {
    if (a.type === "cut") return beginLance({ ...s, lance: 0 });
    if (a.type !== "mus") return null;
    const passed = s.passed + 1;
    if (passed === 4) {
      const mano = s.round === 1 ? (s.mano + 1) % 4 : s.mano;
      return {
        ...s,
        phase: "discard",
        mano,
        turn: mano,
        passed: 0,
        discarded: 0,
        message: "Todos quieren mus: descarta al menos una carta.",
      };
    }
    return { ...s, turn: (s.turn + 1) % 4, passed };
  }
  if (s.phase === "discard") {
    if (
      a.type !== "discard" ||
      !a.indices?.length ||
      new Set(a.indices).size !== a.indices.length ||
      a.indices.some((i) => i < 0 || i > 3)
    )
      return null;
    const hands = s.hands.map((h) => [...h]);
    let stock = [...s.stock],
      muck = [...s.muck, ...a.indices.map((i) => hands[s.turn][i])];
    for (const i of a.indices) {
      if (!stock.length) {
        stock = shuffled(muck, random);
        muck = [];
      }
      hands[s.turn][i] = stock.pop()!;
    }
    const discarded = s.discarded + 1;
    return {
      ...s,
      hands,
      stock,
      muck,
      discarded,
      phase: discarded === 4 ? "mus" : "discard",
      turn: discarded === 4 ? s.mano : (s.turn + 1) % 4,
      passed: 0,
    };
  }
  if (s.phase !== "bet") return null;
  const lance = lances(s)[s.lance],
    players = eligible(s, lance),
    t = team(s.turn);
  if (a.type === "bid") {
    const amount = a.amount === -1 ? -1 : Math.floor(a.amount || 2);
    if ((amount !== -1 && amount < 2) || s.offer === -1 || s.offerTeam === t)
      return null;
    const stake = amount === -1 ? -1 : s.offer + amount,
      responders = players.filter((p) => team(p) !== t),
      next = responders.sort(
        (a, b) => ((a - s.turn + 4) % 4) - ((b - s.turn + 4) % 4),
      )[0];
    return {
      ...s,
      offer: stake,
      previous: s.offer || 1,
      offerTeam: t,
      turn: next,
      passed: 0,
      message:
        "Equipo " +
        (t + 1) +
        " " +
        (stake === -1 ? "lanza órdago" : "envida " + stake),
    };
  }
  if (s.offer) {
    if (t === s.offerTeam) return null;
    if (a.type === "want") {
      if (s.offer === -1) {
        const winning = team(bestPlayer(s, lance)),
          scores = [...s.scores];
        scores[winning] = s.target;
        return {
          ...s,
          scores,
          phase: "over",
          message:
            "Órdago aceptado · gana equipo " + (winning + 1) + " en " + lance,
        };
      }
      return finishBet(s, {
        lance,
        stake: s.offer,
        conceded: null,
        skip: false,
      });
    }
    if (a.type === "pass") {
      const scores = [...s.scores];
      scores[s.offerTeam] += s.previous;
      const n = scoreWinner({ ...s, scores });
      if (n.phase === "over") return n;
      return finishBet(n, {
        lance,
        stake: 0,
        conceded: s.offerTeam,
        skip: false,
      });
    }
    return null;
  }
  if (a.type === "pass") {
    const passed = s.passed + 1;
    if (passed === players.length)
      return finishBet(s, { lance, stake: 0, conceded: null, skip: false });
    const next = players[(players.indexOf(s.turn) + 1) % players.length];
    return { ...s, passed, turn: next };
  }
  return null;
}
export function aiAction(s: State, random = Math.random): Action {
  const hand = s.hands[s.turn],
    pair = pairProfile(hand, s.eight),
    sum = gamePoints(hand, s.eight),
    ranks = hand.map((c) => cardValue(c, s.eight));
  if (s.phase === "mus")
    return {
      type:
        pair[0] >= 2 || sum === 31 || ranks.filter((v) => v === 12).length >= 2
          ? "cut"
          : "mus",
    };
  if (s.phase === "discard") {
    const counts = new Map<number, number>();
    ranks.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    let indices = ranks
      .map((v, i) =>
        (counts.get(v) || 0) === 1 && v !== 12 && v !== 1 ? i : -1,
      )
      .filter((i) => i >= 0);
    if (!indices.length) indices = [ranks.indexOf(Math.min(...ranks))];
    return { type: "discard", indices };
  }
  const lance = lances(s)[s.lance],
    strength =
      lance === "grande"
        ? Math.max(...ranks) / 12
        : lance === "chica"
          ? (13 - Math.min(...ranks)) / 12
          : lance === "pares"
            ? pair[0] / 3
            : lance === "juego"
              ? sum === 31
                ? 1
                : sum === 32
                  ? 0.9
                  : 0.6
              : sum / 30;
  if (s.offer)
    return strength > 0.7 && s.offer !== -1 && s.offer < 6 && random() < 0.3
      ? { type: "bid", amount: 2 }
      : {
          type:
            strength >= (s.offer === -1 ? 0.95 : s.offer >= 8 ? 0.8 : 0.55)
              ? "want"
              : "pass",
        };
  return strength > 0.75 && random() < 0.6
    ? { type: "bid", amount: 2 }
    : { type: "pass" };
}
