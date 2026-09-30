import { type ReactNode, useState } from "react";
import { Settings2, CircleHelp, Bot, Users } from "lucide-react";
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
  mode?: "ai" | "local";
  setMode?: (m: "ai" | "local") => void;
  controls?: ReactNode;
  stats?: ReactNode;
  menu?: ReactNode;
};
export default function GameLayout(p: Props) {
  const observation = useObservation();
  const game = games.find((g) => g.id === p.id)!;
  const [rules, setRules] = useState(false);
  const restart = () => {
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
            {p.started
              ? observation.watching && observation.paused
                ? "En pausa · " + p.status
                : p.status
              : "Elige cómo jugar"}
          </div>
          <div>
            {p.started && <ObservationControls />}
            {p.stats}
            <button
              className="icon-button"
              aria-label="Ajustes de partida"
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
        <div className="play-area" inert={observation.watching}>
          {p.children}
        </div>
        {p.started && p.controls && (
          <div className="surface-controls" inert={observation.watching}>
            {p.controls}
          </div>
        )}
        {p.started && <QuickRestart onRestart={restart} />}
        {!p.started && (
          <Overlay
            title="Ajustes de partida"
            onClose={() => (location.hash = "")}
          >
            {p.setMode ? (
              <div className="mode-selector">
                <button
                  className={
                    !observation.watching && p.mode === "ai" ? "selected" : ""
                  }
                  onClick={() => {
                    observation.setWatching(false);
                    p.setMode!("ai");
                  }}
                >
                  <Bot size={20} /> Contra la IA
                </button>
                <button
                  className={
                    !observation.watching && p.mode === "local"
                      ? "selected"
                      : ""
                  }
                  onClick={() => {
                    observation.setWatching(false);
                    p.setMode!("local");
                  }}
                >
                  <Users size={20} /> Jugadores locales
                </button>
                <ObservationChoice />
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
            {p.menu}
            <button className="primary full" onClick={p.onStart}>
              Empezar partida
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
