import { type CSSProperties } from "react";
import { type Card, label } from "./cards";
import CardFace from "./CardFace";
type Props = {
  columns: Card[][];
  selected: (p: number, i: number) => boolean;
  canSelect: (p: number, i: number) => boolean;
  choose: (p: number, i: number) => void;
  empty: (p: number) => void;
  bind: (p: number, i: number) => object;
  auto?: (p: number, i: number) => void;
};
export default function CardColumns(p: Props) {
  return (
    <div
      className="card-columns"
      style={
        {
          "--cols": p.columns.length,
          "--max-stack": Math.max(2, ...p.columns.map((c) => c.length)),
        } as CSSProperties
      }
    >
      {p.columns.map((col, pile) => (
        <div
          className="card-column"
          key={pile}
          data-drop="column"
          data-pile={pile}
        >
          <button
            className="card-slot"
            aria-label={"Columna " + (pile + 1) + " vacía"}
            onClick={() => p.empty(pile)}
          >
            ◇
          </button>
          {col.map((c, i) => (
            <button
              key={c.id}
              {...p.bind(pile, i)}
              data-draggable={c.up ? "" : undefined}
              data-card-index={i}
              data-drop="column"
              data-pile={pile}
              disabled={!c.up || !p.canSelect(pile, i)}
              className={
                "table-card " + (p.selected(pile, i) ? "selected" : "")
              }
              style={{ top: "calc(var(--step) * " + i + ")" }}
              aria-label={
                c.up
                  ? label(c) + " en columna " + (pile + 1)
                  : "Carta oculta en columna " + (pile + 1)
              }
              onClick={() => p.choose(pile, i)}
              onDoubleClick={() => p.auto?.(pile, i)}
            >
              <CardFace card={c} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
