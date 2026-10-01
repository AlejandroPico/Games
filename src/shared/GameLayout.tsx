import { type ReactNode, useState, useEffect } from "react";
import { Settings2, CircleHelp, Bot, Users, Globe, User } from "lucide-react";
import { useTableRoom, RoomSetup, RoomControls } from "./TableRoom";
import {
  useObservation,
  ObservationChoice,
  ObservationControls,
} from "./Observation";
import GameGuide from "./GameGuide";
import { games, type GameId } from "../games/registry";
import Overlay from "./Overlay";
import QuickRestart from "./QuickRestart";
type Props = {
  id: GameId;
  children: ReactNode;
  status: string;
  rules: string;
  started: boolean;
  onStart: () => void;
  onReset: () => void;
  mode?: "ai" | "local" | "solo";
  setMode?: (m: "ai" | "local") => void;
  soloOption?: () => void;
  roomTurn?: number;
  roomPlayers?: number;
  privateTable?: boolean;
  controls?: ReactNode;
  stats?: ReactNode;
  menu?: ReactNode;
};
export default function GameLayout(p: Props) {
  const observation = useObservation();
  const room = useTableRoom(),
    players = p.roomPlayers || 2;
  useEffect(
    () => room.store.setTurn(p.roomTurn || 0, p.started),
    [room.store, p.roomTurn, p.started],
  );
  useEffect(() => room.store.setCount(players), [room.store, players]);
  const game = games.find((g) => g.id === p.id)!;
  const [rules, setRules] = useState(false);
  const restart = () => {
    if (room.online) room.store.configure({ message: "Todos conectados." });
    p.onReset();
    p.onStart();
  };
  return (
    <div className={"game-page mini-game " + p.id}>
      <section
        className="mini-stage game-surface"
        aria-label={"Mesa de " + game.name}
      >
        <div className="surface-bar">
          <div role="status">
            {room.online && (!room.ready || room.message.includes("pide una"))
              ? room.message
              : p.started
                ? observation.watching && observation.paused
                  ? "En pausa · " + p.status
                  : p.status
                : "Elige cómo jugar"}
          </div>
          <div>
            {p.started && <ObservationControls />}
            <RoomControls />
            {p.stats}
            <button
              className="icon-button"
              aria-label="Ajustes de partida"
              disabled={room.online && !room.host}
              onClick={p.onReset}
            >
              <Settings2 size={20} />
            </button>
            <button
              className="icon-button"
              aria-label="Cómo jugar"
              onClick={() => setRules(true)}
            >
              <CircleHelp size={20} />
            </button>
          </div>
        </div>
        <div
          className="play-area"
          inert={
            observation.watching || (room.online && !room.canAct(p.roomTurn))
          }
        >
          {room.online && p.privateTable && !room.canAct(p.roomTurn) ? (
            <div className="room-wait">
              <Globe size={30} />
              <p>
                {room.ready
                  ? `Turno del jugador ${(p.roomTurn ?? room.turn) + 1}. Tu mesa aparecerá cuando te toque.`
                  : room.message}
              </p>
            </div>
          ) : (
            p.children
          )}
        </div>
        {p.started && p.controls && (
          <div
            className="surface-controls"
            inert={
              observation.watching || (room.online && !room.canAct(p.roomTurn))
            }
          >
            {room.online && p.privateTable && !room.canAct(p.roomTurn)
              ? null
              : p.controls}
          </div>
        )}
        {p.started && (
          <QuickRestart
            onRestart={
              room.online && !room.host
                ? () => room.peer?.requestRestart()
                : restart
            }
            disabled={room.online && !room.ready}
          />
        )}
        {!p.started && (
          <Overlay
            title="Ajustes de partida"
            onClose={() => (location.hash = "")}
          >
            {p.setMode ? (
              <div className="mode-selector">
                <button
                  className={
                    !room.selected && !observation.watching && p.mode === "ai"
                      ? "selected"
                      : ""
                  }
                  disabled={room.online && !room.host}
                  onClick={() => {
                    room.leave();
                    observation.setWatching(false);
                    p.setMode!("ai");
                  }}
                >
                  <Bot size={20} /> Contra la IA
                </button>
                <button
                  className={
                    !room.selected &&
                    !observation.watching &&
                    p.mode === "local"
                      ? "selected"
                      : ""
                  }
                  disabled={room.online && !room.host}
                  onClick={() => {
                    room.leave();
                    observation.setWatching(false);
                    p.setMode!("local");
                  }}
                >
                  <Users size={20} /> Jugadores locales
                </button>
                <button
                  aria-pressed={room.selected}
                  disabled={room.online && !room.host}
                  className={room.selected ? "selected" : ""}
                  onClick={() => {
                    observation.setWatching(false);
                    p.setMode!("local");
                    room.setSelected(true);
                  }}
                >
                  <Globe size={20} /> Con amigos online
                </button>
                <ObservationChoice
                  disabled={room.online && !room.host}
                  onChoose={room.leave}
                />
                {p.soloOption && (
                  <button
                    className={
                      !room.selected &&
                      !observation.watching &&
                      p.mode === "solo"
                        ? "selected"
                        : ""
                    }
                    disabled={room.online && !room.host}
                    onClick={() => {
                      room.leave();
                      observation.setWatching(false);
                      p.soloOption!();
                    }}
                  >
                    <User size={20} /> En solitario
                  </button>
                )}
              </div>
            ) : (
              <div className="mode-selector">
                <button
                  className={!observation.watching ? "selected" : ""}
                  onClick={() => observation.setWatching(false)}
                >
                  Jugar
                </button>
                <ObservationChoice />
              </div>
            )}
            <fieldset
              className="game-options"
              disabled={room.online && !room.host}
            >
              {p.menu}
            </fieldset>
            {p.setMode && room.selected && (
              <RoomSetup
                players={players}
                onLocal={() => p.setMode!("local")}
              />
            )}
            <button
              className="primary full"
              disabled={
                !!p.setMode &&
                room.selected &&
                (!room.online || !room.host || !room.ready)
              }
              onClick={p.onStart}
            >
              {room.online && !room.host
                ? "El anfitrión inicia la partida"
                : "Empezar partida"}
            </button>
          </Overlay>
        )}
        {rules && (
          <Overlay title="Cómo jugar" onClose={() => setRules(false)}>
            <GameGuide id={p.id} summary={p.rules} />
          </Overlay>
        )}
      </section>
    </div>
  );
}
