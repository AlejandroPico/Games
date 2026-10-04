import { useState } from "react";
import type { GameId } from "../games/registry";
import GameLayout from "./GameLayout";
import PrivateHand from "./PrivateHand";
import DeductionIllustration from "./DeductionIllustration";
import { useMatch, useMatchAI, PlayerSelect, ScoreStrip } from "./useMatch";
export interface DeductionPosition {
  turn: number;
  winner: number | null;
  scores: number[];
  step: number;
  message: string;
  outcome?: string;
}
export interface DeductionCard {
  label: string;
  key: string;
  color?: string;
  excluded?: boolean;
  action?: string;
  icon?: string;
}
export interface DeductionEngine<T extends DeductionPosition> {
  initial: (n: number) => T;
  actions: (s: T, text: string) => { key: string; label: string }[];
  apply: (s: T, key: string) => T;
  automatic: (s: T) => T;
  view: (s: T) => {
    cards: DeductionCard[];
    notes: string[];
    private?: string;
    textLabel?: string;
  };
}
export default function DeductionTable<T extends DeductionPosition>({
  id,
  engine,
  choices = [2],
  privateTable = true,
  workerFactory,
}: {
  id: GameId;
  engine: DeductionEngine<T>;
  choices?: number[];
  privateTable?: boolean;
  workerFactory?: () => Worker;
}) {
  const m = useMatch(engine.initial, choices[0]),
    s = m.state,
    ai = useMatchAI(
      m,
      s.turn,
      s.winner !== null,
      engine.automatic,
      workerFactory,
    ),
    [text, setText] = useState(""),
    [choice, setChoice] = useState("");
  const v = engine.view(s),
    a = engine.actions(s, text),
    current = a.some((a) => a.key === choice) ? choice : a[0]?.key || "";
  const act = (key: string) => {
    if (!ai && m.started) {
      m.setState((x) => engine.apply(x, key));
      setChoice("");
      setText("");
    }
  };
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={() => {
        setText("");
        setChoice("");
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      privateTable={privateTable && s.winner === null}
      status={
        s.winner !== null
          ? s.outcome || (s.winner < 0 ? "Empate" : `Gana J${s.winner + 1}`)
          : `J${s.turn + 1} · ${s.message}`
      }
      rules="Las reglas, ejemplos y límites de la IA están en esta guía. La información privada se muestra únicamente en el turno correspondiente."
      menu={
        <>
          <PlayerSelect
            choices={choices}
            value={m.players}
            onChange={m.setPlayers}
          />
          {m.seats}
        </>
      }
    >
      <div className="deduction-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <PrivateHand
          token={`${s.step}-${s.turn}`}
          conceal={
            privateTable &&
            m.mode === "local" &&
            !m.room.online &&
            !ai &&
            m.started &&
            s.winner === null
          }
        >
          {v.private && (
            <p className="table-message">
              <strong>{v.private}</strong>
            </p>
          )}
          <div
            className={
              "deduction-cards" +
              (id === "adivina-quien" ? " portrait-grid" : "")
            }
          >
            {v.cards.map((c) => (
              <button
                key={c.key}
                style={{ background: c.color }}
                disabled={!c.action || ai || !m.started || s.winner !== null}
                className={c.excluded ? "excluded" : ""}
                aria-label={c.label}
                onClick={() => c.action && act(c.action)}
              >
                {c.icon && (
                  <span className="deduction-illustration" aria-hidden="true">
                    <DeductionIllustration value={c.icon} />
                  </span>
                )}
                {c.label}
              </button>
            ))}
          </div>
          {m.started && s.winner === null && (
            <div className="table-action">
              {v.textLabel && (
                <label>
                  {v.textLabel}
                  <input
                    aria-label={v.textLabel}
                    maxLength={100}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </label>
              )}
              <label>
                Acción
                <select
                  aria-label="Acción de turno"
                  value={current}
                  onChange={(e) => setChoice(e.target.value)}
                >
                  {a.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={ai || !current}
                onClick={() => act(current)}
              >
                Confirmar acción
              </button>
            </div>
          )}
          <div className="deduction-notes" aria-label="Cuaderno de pistas">
            {v.notes.join("\n")}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
