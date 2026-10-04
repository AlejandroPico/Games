import { useState } from "react";
import type { GameId } from "../games/registry";
import GameLayout from "./GameLayout";
import PrivateHand from "./PrivateHand";
import Overlay from "./Overlay";
import { useMatch, useMatchAI, PlayerSelect, ScoreStrip } from "./useMatch";
import type { DeductionEngine, DeductionPosition } from "./DeductionTable";
export interface StrategyScene {
  columns: number;
  cells: {
    key: string;
    label: string;
    symbol: string;
    owner?: number;
    action?: string;
    detail?: string;
  }[];
}
export interface StrategyEngine<
  T extends DeductionPosition,
> extends DeductionEngine<T> {
  scene?: (s: T) => StrategyScene;
  publicScores?: (s: T) => (number | null)[];
}
/** Shared presentation and turn transport; no rules or scoring are implemented here. */
export default function StrategyTable<T extends DeductionPosition>({
  id,
  engine,
  choices = [2, 3, 4],
  privateTable = false,
  workerFactory,
}: {
  id: GameId;
  engine: StrategyEngine<T>;
  choices?: number[];
  privateTable?: boolean;
  workerFactory: () => Worker;
}) {
  const m = useMatch(engine.initial, choices[0]),
    s = m.state;
  const ai = useMatchAI(
    m,
    s.turn,
    s.winner !== null,
    engine.automatic,
    workerFactory,
  );
  const [choice, setChoice] = useState(""),
    [journal, setJournal] = useState(false);
  const v = engine.view(s),
    scene = engine.scene?.(s),
    actions = engine.actions(s, "");
  const selected = actions.some((a) => a.key === choice)
    ? choice
    : actions[0]?.key || "";
  const act = (key: string) => {
    if (m.started && !ai && s.winner === null) {
      m.setState((x) => engine.apply(x, key));
      setChoice("");
    }
  };
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={() => {
        setChoice("");
        setJournal(false);
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
      rules="Consulta el objetivo, la preparación, cada fase y los ejemplos de esta edición en la guía."
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
      <div className="strategy-table">
        <ScoreStrip
          scores={engine.publicScores?.(s) || s.scores}
          turn={s.turn}
        />
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
          <div className="strategy-content">
            {v.private && <p className="strategy-private">{v.private}</p>}
            {scene && (
              <div
                className="strategy-map"
                style={{
                  gridTemplateColumns: `repeat(${scene.columns},minmax(0,1fr))`,
                }}
                aria-label="Tablero de partida"
              >
                {scene.cells.map((c) => (
                  <button
                    key={c.key}
                    className={`strategy-space ${c.owner !== undefined ? `owner-${c.owner % 4}` : ""}`}
                    disabled={
                      !c.action || ai || !m.started || s.winner !== null
                    }
                    onClick={() => c.action && act(c.action)}
                    aria-label={c.label}
                  >
                    <span className="strategy-symbol" aria-hidden="true">
                      {c.symbol}
                    </span>
                    <span>{c.label}</span>
                    {c.detail && <small>{c.detail}</small>}
                  </button>
                ))}
              </div>
            )}
            <div className="strategy-market" aria-label="Cartas y recursos">
              {v.cards.map((c) => (
                <button
                  key={c.key}
                  disabled={!c.action || ai || !m.started || s.winner !== null}
                  onClick={() => c.action && act(c.action)}
                  className={c.excluded ? "spent" : ""}
                  style={{ borderBottomColor: c.color }}
                >
                  <span aria-hidden="true">{c.icon || "◇"}</span>
                  {c.label}
                </button>
              ))}
            </div>
            {m.started && s.winner === null && (
              <div className="strategy-action">
                <label>
                  Acción de turno
                  <select
                    aria-label="Acción de turno"
                    value={selected}
                    onChange={(e) => setChoice(e.target.value)}
                  >
                    {actions.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="primary"
                  disabled={ai || !selected}
                  onClick={() => act(selected)}
                >
                  Confirmar acción
                </button>
              </div>
            )}
            <div className="strategy-summary">
              <p>{v.notes[0]}</p>
              <button onClick={() => setJournal(true)}>
                Registro y detalles
              </button>
            </div>
            {journal && (
              <Overlay
                title="Estado y registro"
                onClose={() => setJournal(false)}
              >
                <div className="strategy-journal">
                  {v.notes.map((n, i) => (
                    <p key={i}>{n}</p>
                  ))}
                </div>
              </Overlay>
            )}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
