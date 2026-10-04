import { useState, type ReactNode } from "react";
import GameLayout from "./GameLayout";
import PrivateHand from "./PrivateHand";
import { useMatch, useMatchAI, PlayerSelect, ScoreStrip } from "./useMatch";
import type { GameId } from "../games/registry";
export interface DicePosition {
  turn: number;
  winner: number | null;
  scores: number[];
  dice: number[];
  message: string;
  step: number;
  outcome?: string;
}
export interface DiceAction {
  key: string;
  label: string;
}
export interface DiceEngine<T extends DicePosition> {
  initial: (players: number, target: number) => T;
  actions: (s: T) => DiceAction[];
  apply: (s: T, key: string) => T;
  automatic: (s: T) => T;
}
/** Presentation and lifecycle only; scoring and transitions belong to each game's folder. */
export default function DiceTable<T extends DicePosition>({
  id,
  engine,
  choices = [2, 3, 4],
  targets = [10],
  targetLabel = "Rondas",
  privateDice = false,
  detail,
}: {
  id: GameId;
  engine: DiceEngine<T>;
  choices?: number[];
  targets?: number[];
  targetLabel?: string;
  privateDice?: boolean | ((s: T) => boolean);
  detail?: (s: T) => ReactNode;
}) {
  const [target, setTarget] = useState(targets[0]);
  const m = useMatch((n) => engine.initial(n, target), choices[0]),
    s = m.state;
  const ai = useMatchAI(m, s.turn, s.winner !== null, engine.automatic);
  const concealed =
    typeof privateDice === "function" ? privateDice(s) : privateDice;
  const options = engine.actions(s),
    [selected, select] = useState("");
  const current = options.some((a) => a.key === selected)
    ? selected
    : options[0]?.key || "";
  const begin = () => {
    select("");
    m.start();
  };
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={begin}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomPlayers={m.players}
      roomTurn={s.turn}
      privateTable={concealed}
      status={
        s.winner !== null
          ? s.outcome || (s.winner < 0 ? "Empate" : `Gana J${s.winner + 1}`)
          : `J${s.turn + 1} · ${s.message}`
      }
      rules="Consulta la guía para ver la puntuación y la variante de esta mesa. Todos los créditos son ficticios."
      menu={
        <>
          <PlayerSelect
            choices={choices}
            value={m.players}
            onChange={m.setPlayers}
          />
          {targets.length > 1 && (
            <label>
              {targetLabel}
              <select
                value={target}
                onChange={(e) => setTarget(+e.target.value)}
              >
                {targets.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          {m.seats}
        </>
      }
    >
      <div className="dice-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <PrivateHand
          token={`${s.step}-${s.turn}`}
          conceal={
            concealed &&
            m.mode === "local" &&
            !m.room.online &&
            !ai &&
            m.started
          }
        >
          <div className="dice-rack">
            {s.dice.map((d, i) => (
              <span
                key={i}
                className={`sculpted-die face-${d}`}
                aria-label={`Dado ${i + 1}: ${d}`}
              >
                <span>{["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][d] || d}</span>
              </span>
            ))}
          </div>
          {detail?.(s)}
          <p className="table-message">{s.message}</p>
          {m.started && s.winner === null && (
            <div className="table-action">
              <label>
                Acción
                <select
                  aria-label="Acción de turno"
                  value={current}
                  onChange={(e) => select(e.target.value)}
                >
                  {options.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={ai || !current}
                onClick={() => {
                  m.setState((x) => engine.apply(x, current));
                  select("");
                }}
              >
                Confirmar acción
              </button>
            </div>
          )}
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
