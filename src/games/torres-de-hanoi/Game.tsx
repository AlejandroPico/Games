import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { initial, move, nextMove } from "./rules";
export default function Hanoi() {
  const [n, setN] = useState(5),
    [selected, select] = useState<number | null>(null);
  const m = useMatch(() => initial(n), 1),
    s = m.state;
  const ai = useMatchAI(m, 0, s.won, (x) => {
    const a = nextMove(x);
    return a ? move(x, ...a) : x;
  });
  const play = (a: number, b: number) => {
    m.setState((x) => move(x, a, b));
    select(null);
  };
  const drag = usePieceDrag<number>({
    canDrag: (a) => m.started && !ai && !s.won && !!s.pegs[a].length,
    onDrop: (a, e) => {
      const b = Number(e?.dataset.drop);
      if (e && move(s, a, b) !== s) {
        play(a, b);
        return true;
      }
      return false;
    },
  });
  return (
    <GameLayout
      id="torres-de-hanoi"
      started={m.started}
      onStart={() => {
        select(null);
        m.start();
      }}
      onReset={m.reset}
      status={
        s.won
          ? "¡Torre reconstruida!"
          : `${s.moves} movimientos · mínimo inicial ${2 ** n - 1}`
      }
      rules="Mueve un disco cada vez hasta la tercera torre. Nunca coloques uno grande sobre uno pequeño."
      menu={
        <label>
          Discos
          <select value={n} onChange={(e) => setN(+e.target.value)}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      }
      controls={
        <button
          onClick={() => {
            const a = nextMove(s);
            if (a) play(...a);
          }}
        >
          Siguiente paso
        </button>
      }
    >
      <div className="hanoi-table">
        {s.pegs.map((peg, i) => (
          <button
            key={i}
            data-drop={i}
            className={"hanoi-peg " + (selected === i ? "chosen" : "")}
            aria-label={`Torre ${i + 1}, ${peg.length} discos`}
            onClick={() => {
              if (drag.suppressClick()) return;
              if (selected === null) select(i);
              else play(selected, i);
            }}
          >
            <span className="hanoi-rod" />
            <span className="hanoi-stack">
              {[...peg].reverse().map((d, k) => (
                <span
                  key={d}
                  {...(k === 0 ? drag.bind(i) : {})}
                  className="hanoi-disk"
                  style={{
                    width: `${25 + (d / n) * 65}%`,
                    background: `hsl(${190 + d * 19} 55% 50%)`,
                  }}
                >
                  {d}
                </span>
              ))}
            </span>
            <span className="hanoi-base" />
            <small>{i === 2 ? "Destino" : `Torre ${i + 1}`}</small>
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
