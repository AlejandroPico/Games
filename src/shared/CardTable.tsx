import { useState } from "react";
import type { GameId } from "../games/registry";
import type { DeductionPosition } from "./DeductionTable";
import GameLayout from "./GameLayout";
import PrivateHand from "./PrivateHand";
import Overlay from "./Overlay";
import { useMatch, useMatchAI, PlayerSelect, ScoreStrip } from "./useMatch";
export interface DisplayCard {
  key: string;
  rank: string;
  suit: string;
  label: string;
  red?: boolean;
  action?: string;
}
export interface CardEngine<T extends DeductionPosition> {
  initial: (n: number) => T;
  actions: (s: T) => { key: string; label: string }[];
  apply: (s: T, key: string) => T;
  automatic: (s: T) => T;
  view: (s: T) => {
    hand: DisplayCard[];
    table: DisplayCard[];
    notes: string[];
    summary: string;
    actor?: number;
  };
}
/** Presentation only: each module owns its deck, phases, legality and scoring. */
export default function CardTable<T extends DeductionPosition>({
  id,
  engine,
  choices,
  workerFactory,
}: {
  id: GameId;
  engine: CardEngine<T>;
  choices: number[];
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
    [details, setDetails] = useState(false);
  const v = engine.view(s),
    a = engine.actions(s),
    selected = a.some((x) => x.key === choice) ? choice : a[0]?.key || "";
  const act = (key: string) => {
    if (m.started && !ai && s.winner === null) {
      m.setState((x) => engine.apply(x, key));
      setChoice("");
    }
  };
  const card = (c: DisplayCard) => (
    <button
      key={c.key}
      className={"edition-card" + (c.red ? " red" : "")}
      aria-label={c.label}
      disabled={!c.action || ai || !m.started || s.winner !== null}
      onClick={() => c.action && act(c.action)}
    >
      <span className="edition-corner">
        {c.rank}
        <small>{c.suit}</small>
      </span>
      <span className="edition-suit" aria-hidden="true">
        {c.suit}
      </span>
      <small className="edition-caption">{c.label}</small>
    </button>
  );
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={() => {
        setChoice("");
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      privateTable={s.winner === null}
      status={
        s.winner !== null
          ? s.outcome || "Partida terminada"
          : `J${s.turn + 1} · ${s.message}`
      }
      rules="Consulta las fases, la puntuación y la variante de esta mesa en la ayuda."
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
      <div className="edition-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <p className="edition-summary">{v.summary}</p>
        <div className="edition-public" aria-label="Cartas de la mesa">
          {v.table.map(card)}
        </div>
        <PrivateHand
          key={s.turn}
          token={String(s.turn)}
          conceal={
            m.mode === "local" &&
            !m.room.online &&
            !ai &&
            m.started &&
            s.winner === null
          }
        >
          <div className="edition-private">
            <p>Mano de J{(v.actor ?? s.turn) + 1}</p>
            <div className="edition-hand" aria-label="Mano de cartas">
              {v.hand.map(card)}
            </div>
            <div className="edition-actions">
              <label>
                Acción
                <select
                  aria-label="Acción de cartas"
                  value={selected}
                  onChange={(e) => setChoice(e.target.value)}
                >
                  {a.map((x) => (
                    <option key={x.key} value={x.key}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={!selected || ai || !m.started || s.winner !== null}
                onClick={() => act(selected)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </PrivateHand>
        <button className="edition-details" onClick={() => setDetails(true)}>
          Registro y detalles
        </button>
      </div>
      {details && (
        <Overlay title="Registro y detalles" onClose={() => setDetails(false)}>
          {v.notes.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
        </Overlay>
      )}
    </GameLayout>
  );
}
