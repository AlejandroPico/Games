import { type CSSProperties } from "react";
import { type Card, label } from "./cards";
import CardFace from "./CardFace";
export default function HandCards({
  cards,
  spanish = false,
  hidden = false,
  onCard,
  selected = [],
  disabled = false,
}: {
  cards: Card[];
  spanish?: boolean;
  hidden?: boolean;
  onCard?: (i: number) => void;
  selected?: number[];
  disabled?: boolean;
}) {
  return (
    <div
      className="hand-cards"
      style={{ "--count": cards.length } as CSSProperties}
    >
      {cards.map((c, i) => (
        <button
          key={c.id}
          className={"table-card " + (selected.includes(i) ? "selected" : "")}
          style={{
            left:
              "calc((100% - var(--fan-width)) * " +
              i +
              "/" +
              Math.max(1, cards.length - 1) +
              ")",
          }}
          disabled={disabled || hidden || !onCard}
          aria-label={hidden || !c.up ? "Carta oculta" : label(c, spanish)}
          onClick={() => onCard?.(i)}
        >
          <CardFace card={c} spanish={spanish} hidden={hidden} />
        </button>
      ))}
    </div>
  );
}
