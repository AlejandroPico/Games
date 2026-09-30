export type Card = { id: number; rank: number; suit: number; up: boolean };
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const deck = () =>
  Array.from({ length: 52 }, (_, i) => ({
    id: i,
    rank: (i % 13) + 1,
    suit: Math.floor(i / 13),
    up: true,
  }));
export const spanishDeck = () =>
  Array.from({ length: 40 }, (_, i) => ({
    id: i,
    rank: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12][i % 10],
    suit: Math.floor(i / 10),
    up: true,
  }));
export const red = (c: Card) => c.suit === 1 || c.suit === 2;
export const rank = (n: number) =>
  ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][n];
export const suits = ["♠", "♥", "♦", "♣"],
  spanishSuits = ["oros", "copas", "espadas", "bastos"];
export const label = (c: Card, spanish = false) =>
  (spanish
    ? (
        { 1: "As", 10: "Sota", 11: "Caballo", 12: "Rey" } as Record<
          number,
          string
        >
      )[c.rank] || c.rank
    : rank(c.rank)) +
  " de " +
  (spanish
    ? spanishSuits[c.suit]
    : ["picas", "corazones", "diamantes", "tréboles"][c.suit]);
