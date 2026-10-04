import { shuffled } from "../../shared/cards";
export type Card = {
  id: number;
  name: string;
  type: "resource" | "culture" | "army" | "science" | "commerce";
  cost: number;
  value: number;
  symbol: number;
  resource: number;
};
export type City = {
  coins: number;
  resources: number[];
  culture: number;
  army: number;
  science: number[];
  wonder: number;
  military: number;
  cards: Card[];
};
export type State = {
  hands: Card[][];
  cities: City[];
  chosen: { card: Card; action: string }[];
  age: number;
  pick: number;
  turn: number;
  ply: number;
  winner: number[] | null;
  discard: Card[];
};
function hands(n: number, age: number) {
  const names = [
    "Cantera",
    "Aserradero",
    "Biblioteca",
    "Teatro",
    "Cuartel",
    "Observatorio",
    "Mercado",
  ];
  return shuffled(
    Array.from({ length: n * 7 }, (_, i) => {
      const k = i % 7,
        type: Card["type"] =
          k < 2
            ? "resource"
            : k === 2 || k === 5
              ? "science"
              : k === 3
                ? "culture"
                : k === 4
                  ? "army"
                  : "commerce";
      return {
        id: age * 100 + i,
        name: names[k],
        type,
        cost: type === "resource" ? 0 : age,
        value:
          type === "culture"
            ? age * 2 + 1
            : type === "army"
              ? age
              : type === "commerce"
                ? 4
                : 1,
        symbol: i % 3,
        resource: k % 2,
      };
    }),
  ).reduce<Card[][]>(
    (a, c, i) => {
      a[Math.floor(i / 7)].push(c);
      return a;
    },
    Array.from({ length: n }, () => []),
  );
}
export function initial(n: number): State {
  return {
    hands: hands(n, 1),
    cities: Array.from({ length: n }, () => ({
      coins: 6,
      resources: [0, 0],
      culture: 0,
      army: 0,
      science: [0, 0, 0],
      wonder: 0,
      military: 0,
      cards: [],
    })),
    chosen: [],
    age: 1,
    pick: 0,
    turn: 0,
    ply: 0,
    winner: null,
    discard: [],
  };
}
export function cost(s: State, c: Card) {
  const city = s.cities[s.turn];
  return c.cost + (c.cost && city.resources[c.resource] === 0 ? 2 : 0);
}
export function scores(s: State) {
  return s.cities.map(
    (c) =>
      c.culture +
      c.wonder * 5 +
      c.military +
      Math.floor(c.coins / 3) +
      c.science.reduce((v, n) => v + n * n, 0) +
      Math.min(...c.science) * 7,
  );
}
export function choose(s: State, index: number, action: string): State {
  const card = s.hands[s.turn][index],
    city = s.cities[s.turn];
  if (
    s.winner ||
    !card ||
    !["build", "sell", "wonder"].includes(action) ||
    (action === "build" && city.coins < cost(s, card)) ||
    (action === "wonder" && (city.wonder >= 3 || city.coins < 4 + s.age))
  )
    return s;
  const x = structuredClone(s);
  x.hands[x.turn].splice(index, 1);
  x.chosen.push({ card, action });
  x.turn++;
  x.ply++;
  if (x.turn < x.cities.length) return x;
  x.chosen.forEach(({ card, action }, p) => {
    const c = x.cities[p];
    if (action === "sell") {
      c.coins += 3;
      x.discard.push(card);
    } else if (action === "wonder") {
      c.coins -= 4 + x.age;
      c.wonder++;
      x.discard.push(card);
    } else {
      c.coins -=
        card.cost + (card.cost && c.resources[card.resource] === 0 ? 2 : 0);
      c.cards.push(card);
      if (card.type === "resource") c.resources[card.resource]++;
      if (card.type === "culture") c.culture += card.value;
      if (card.type === "army") c.army += card.value;
      if (card.type === "science") c.science[card.symbol]++;
      if (card.type === "commerce") c.coins += card.value;
    }
  });
  x.chosen = [];
  x.turn = 0;
  x.pick++;
  if (x.pick === 6) {
    x.discard.push(...x.hands.flat());
    x.cities.forEach((c, p) => {
      for (const neighbor of [
        (p + x.cities.length - 1) % x.cities.length,
        (p + 1) % x.cities.length,
      ])
        c.military +=
          c.army > x.cities[neighbor].army
            ? x.age * 2 - 1
            : c.army < x.cities[neighbor].army
              ? -1
              : 0;
    });
    if (x.age === 3) {
      const result = scores(x),
        max = Math.max(...result);
      x.winner = result.flatMap((v, p) => (v === max ? [p] : []));
      x.hands = x.hands.map(() => []);
    } else {
      x.age++;
      x.pick = 0;
      x.hands = hands(x.cities.length, x.age);
    }
  } else {
    const old = x.hands;
    x.hands = old.map(
      (_, p) => old[(p + (x.age === 2 ? 1 : old.length - 1)) % old.length],
    );
  }
  return x;
}
export function automatic(s: State): State {
  let index = 0,
    action = "sell",
    best = -Infinity;
  s.hands[s.turn].forEach((c, i) => {
    const city = s.cities[s.turn];
    if (city.coins >= cost(s, c)) {
      const score =
        c.type === "science"
          ? city.science[c.symbol] * 2 + 3
          : c.type === "army"
            ? c.value * 2
            : c.type === "resource"
              ? city.resources[c.resource]
                ? 1
                : 6
              : c.value;
      if (score > best) {
        best = score;
        index = i;
        action = "build";
      }
    }
    if (city.wonder < 3 && city.coins >= 4 + s.age && best < 5) {
      best = 5;
      index = i;
      action = "wonder";
    }
  });
  return choose(s, index, action);
}
