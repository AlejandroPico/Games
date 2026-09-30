import { deck, shuffled, type Card } from "../../shared/cards";
export type Hand = {
  cards: Card[];
  bet: number;
  status: "playing" | "stand" | "bust" | "surrender";
  split: boolean;
};
export type State = {
  shoe: Card[];
  dealer: Card[];
  hands: Hand[];
  active: number;
  bank: number;
  phase: "insurance" | "play" | "over";
  insurance: number;
  message: string;
  soft17: boolean;
};
export function total(cards: Card[]) {
  let value = cards.reduce(
      (n, c) => n + (c.rank === 1 ? 11 : Math.min(10, c.rank)),
      0,
    ),
    aces = cards.filter((c) => c.rank === 1).length;
  while (value > 21 && aces) {
    value -= 10;
    aces--;
  }
  return { value, soft: aces > 0 };
}
export const natural = (cs: Card[]) =>
  cs.length === 2 && total(cs).value === 21;
export function initial(
  bet = 20,
  soft17 = false,
  random = Math.random,
  bank = 500,
): State {
  const shoe = shuffled(
      Array.from({ length: 6 }, (_, n) =>
        deck().map((c) => ({ ...c, id: n * 52 + c.id })),
      ).flat(),
      random,
    ),
    player = [shoe.pop()!, shoe.pop()!],
    dealer = [shoe.pop()!, shoe.pop()!],
    s: State = {
      shoe,
      dealer,
      hands: [{ cards: player, bet, status: "playing", split: false }],
      active: 0,
      bank: bank - bet,
      phase: dealer[0].rank === 1 ? "insurance" : "play",
      insurance: 0,
      message: "",
      soft17,
    };
  if (s.phase === "play" && (natural(dealer) || natural(player)))
    return settle(s);
  return s;
}
export function insurance(s: State, accept: boolean): State {
  if (s.phase !== "insurance") return s;
  const cost = accept ? Math.min(s.hands[0].bet / 2, s.bank) : 0,
    n = { ...s, bank: s.bank - cost, insurance: cost, phase: "play" as const };
  return natural(s.dealer) || natural(s.hands[0].cards) ? settle(n) : n;
}
export function canSplit(s: State) {
  const h = s.hands[s.active];
  return (
    s.phase === "play" &&
    h?.status === "playing" &&
    h.cards.length === 2 &&
    h.cards[0].rank === h.cards[1].rank &&
    s.hands.length < 4 &&
    s.bank >= h.bet
  );
}
export function settle(s: State): State {
  const shoe = [...s.shoe],
    dealer = [...s.dealer];
  if (
    !natural(dealer) &&
    s.hands.some(
      (h) =>
        h.status !== "bust" &&
        h.status !== "surrender" &&
        !(natural(h.cards) && !h.split),
    )
  ) {
    while (
      total(dealer).value < 17 ||
      (s.soft17 && total(dealer).value === 17 && total(dealer).soft)
    ) {
      dealer.push(shoe.pop()!);
    }
  }
  let bank = s.bank + (natural(dealer) ? s.insurance * 3 : 0);
  const messages = s.hands.map((h, i) => {
    const v = total(h.cards).value,
      d = total(dealer).value;
    let payment = 0,
      word = "pierde";
    if (h.status === "surrender") {
      word = "rendida";
    } else if (v > 21) {
      word = "se pasa";
    } else if (natural(dealer)) {
      if (natural(h.cards) && !h.split) {
        payment = h.bet;
        word = "empata";
      }
    } else if (natural(h.cards) && !h.split) {
      payment = h.bet * 2.5;
      word = "Blackjack";
    } else if (d > 21 || v > d) {
      payment = h.bet * 2;
      word = "gana";
    } else if (v === d) {
      payment = h.bet;
      word = "empata";
    }
    bank += payment;
    return "Mano " + (i + 1) + " " + word;
  });
  return {
    ...s,
    shoe,
    dealer,
    bank,
    phase: "over",
    message: messages.join(" · "),
  };
}
export function act(
  s: State,
  action: "hit" | "stand" | "double" | "split" | "surrender",
): State | null {
  if (s.phase !== "play") return null;
  const hands = s.hands.map((h) => ({ ...h, cards: [...h.cards] })),
    shoe = [...s.shoe];
  let bank = s.bank;
  const h = hands[s.active];
  if (!h || h.status !== "playing") return null;
  if (action === "split") {
    if (!canSplit(s)) return null;
    const ace = h.cards[0].rank === 1,
      cards = h.cards;
    const first = {
        cards: [cards[0], shoe.pop()!],
        bet: h.bet,
        status: ace ? ("stand" as const) : ("playing" as const),
        split: true,
      },
      second = {
        cards: [cards[1], shoe.pop()!],
        bet: h.bet,
        status: ace ? ("stand" as const) : ("playing" as const),
        split: true,
      };
    for (const hand of [first, second])
      if (total(hand.cards).value === 21) hand.status = "stand";
    hands.splice(s.active, 1, first, second);
    bank -= h.bet;
  } else if (action === "stand") h.status = "stand";
  else if (action === "surrender") {
    if (h.split || h.cards.length !== 2 || hands.length !== 1) return null;
    h.status = "surrender";
    bank += h.bet / 2;
  } else {
    if (action === "double") {
      if (h.cards.length !== 2 || bank < h.bet) return null;
      bank -= h.bet;
      h.bet *= 2;
    }
    h.cards.push(shoe.pop()!);
    const value = total(h.cards).value;
    h.status =
      value > 21
        ? "bust"
        : action === "double" || value === 21
          ? "stand"
          : "playing";
  }
  const n = { ...s, hands, shoe, bank };
  if (hands[s.active]?.status === "playing") return n;
  const next = hands.findIndex(
    (h, i) => i >= s.active && h.status === "playing",
  );
  if (next >= 0) return { ...n, active: next };
  return settle(n);
}
