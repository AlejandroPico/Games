import { type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bot, Users, RotateCcw } from "lucide-react";
import { games, type GameId } from "../games/registry";
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
  const game = games.find((g) => g.id === p.id)!;
  return (
    <div className={"game-page mini-game " + p.id}>
      <div className="game-breadcrumb">
        <a href="#">
          <ArrowLeft size={16} /> La colección
        </a>
        <span>/</span>
        <span>{game.name}</span>
      </div>
      <div className="game-title">
        <div>
          <div className="eyebrow">
            {game.category.toUpperCase()} · {game.subtitle.toUpperCase()}
          </div>
          <h1>
            {game.name}
            <span>.</span>
          </h1>
        </div>
        <span className="pill">{game.players}</span>
      </div>
      <div className="chess-layout">
        <section className="mini-stage">{p.children}</section>
        <aside className="game-sidebar">
          <div className="eyebrow">
            {p.started ? "TU PARTIDA" : "TU PRÓXIMA PARTIDA"}
          </div>
          <h2>
            {p.started ? "Sigue tu instinto." : "Un nuevo reto te espera."}
          </h2>
          <p className="muted">{game.subtitle}</p>
          {p.started ? (
            <>
              <div className="game-status" role="status">
                <span className="status-dot" />
                {p.status}
              </div>
              {p.stats}
              {p.controls}
              <button
                className="primary full"
                onClick={() => {
                  p.onReset();
                }}
              >
                <RotateCcw size={16} /> Nueva partida
              </button>
            </>
          ) : (
            <>
              {p.setMode && (
                <div className="mode-selector">
                  <button
                    className={p.mode === "ai" ? "selected" : ""}
                    onClick={() => p.setMode!("ai")}
                  >
                    <Bot size={21} />
                    <span>
                      <strong>Contra la IA</strong>
                      <small>Un rival que piensa</small>
                    </span>
                    <span className="radio" />
                  </button>
                  <button
                    className={p.mode === "local" ? "selected" : ""}
                    onClick={() => p.setMode!("local")}
                  >
                    <Users size={21} />
                    <span>
                      <strong>Dos jugadores</strong>
                      <small>En el mismo dispositivo</small>
                    </span>
                    <span className="radio" />
                  </button>
                </div>
              )}
              {p.menu}
              <button className="primary full" onClick={p.onStart}>
                Empezar partida <ArrowRight size={17} />
              </button>
            </>
          )}
          <details className="mini-rules" open={!p.started}>
            <summary>Cómo jugar</summary>
            <p>{p.rules}</p>
          </details>
        </aside>
      </div>
    </div>
  );
}
