import { type Card, rank, suits } from "./cards";
export function SpanishSuit({ suit }: { suit: number }) {
  return (
    <svg viewBox="0 0 70 100" aria-hidden="true">
      {suit === 0 ? (
        <>
          <circle
            cx="35"
            cy="50"
            r="25"
            fill="#d8ac4d"
            stroke="#9c762f"
            strokeWidth="3"
          />
          <circle
            cx="35"
            cy="50"
            r="18"
            fill="none"
            stroke="#fff0b2"
            strokeWidth="2"
          />
          <path
            d="M35 35v30m-9-23h18m-18 15h18"
            stroke="#9c762f"
            strokeWidth="3"
          />
        </>
      ) : suit === 1 ? (
        <>
          <path
            d="M15 20h40l-6 33-14 12-14-12Z"
            fill="#bd754f"
            stroke="#925536"
            strokeWidth="2"
          />
          <path d="M35 62v19m-14 2h28" stroke="#bd754f" strokeWidth="6" />
          <path d="M19 30h32" stroke="#efd591" strokeWidth="3" />
        </>
      ) : suit === 2 ? (
        <>
          <path
            d="M35 7l7 55H28Z"
            fill="#96b4c3"
            stroke="#567889"
            strokeWidth="2"
          />
          <path d="M16 63h38m-19 0v24" stroke="#bd9854" strokeWidth="6" />
          <circle cx="35" cy="91" r="5" fill="#bd9854" />
        </>
      ) : (
        <>
          <path
            d="M35 90L18 22l6-10 10 9 11-8 8 12Z"
            fill="#729769"
            stroke="#466547"
            strokeWidth="2"
          />
          <path
            d="M30 30l12 8-8 10 10 10-7 12"
            fill="none"
            stroke="#b9c890"
            strokeWidth="3"
          />
        </>
      )}
    </svg>
  );
}
export default function CardFace({
  card,
  spanish = false,
  hidden = false,
}: {
  card: Card;
  spanish?: boolean;
  hidden?: boolean;
}) {
  if (hidden || !card.up)
    return (
      <span className="card-face card-back" aria-hidden="true">
        G
      </span>
    );
  return (
    <span
      className={
        "card-face " +
        (!spanish && (card.suit === 1 || card.suit === 2) ? "red" : "")
      }
      aria-hidden="true"
    >
      <span className="card-corner">
        {spanish
          ? ({ 1: "A", 10: "S", 11: "C", 12: "R" } as Record<number, string>)[
              card.rank
            ] || card.rank
          : rank(card.rank)}
        <small>
          {spanish ? <SpanishSuit suit={card.suit} /> : suits[card.suit]}
        </small>
      </span>
      <span className="card-center">
        {spanish ? <SpanishSuit suit={card.suit} /> : suits[card.suit]}
      </span>
    </span>
  );
}
