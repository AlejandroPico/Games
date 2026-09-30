import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import { createFleet, fire, defeated, target, lengths } from "./rules";
export default function Battleship() {
  const [own, setOwn] = useState(createFleet),
    [enemy, setEnemy] = useState(createFleet),
    [shots, setShots] = useState<number[]>(Array(100).fill(0)),
    [received, setReceived] = useState<number[]>(Array(100).fill(0)),
    [turn, setTurn] = useState(1),
    [started, setStarted] = useState(false),
    [message, setMessage] = useState("Localiza la flota rival.");
  const won = defeated(enemy, shots),
    lost = defeated(own, received),
    over = won || lost;
  useEffect(() => {
    if (!started || turn !== 2 || over) return;
    const timer = setTimeout(() => {
      const remaining = lengths.filter(
        (_, id) =>
          !own
            .map((v, i) => (v === id ? i : -1))
            .filter((i) => i !== -1)
            .every((i) => received[i] === 3),
      );
      const index = target(received, remaining),
        result = fire(own, received, index);
      if (result) {
        setReceived(result.shots);
        setMessage(
          result.sunk !== null
            ? "La IA ha hundido un barco tuyo."
            : result.hit
              ? "La IA ha tocado tu flota."
              : "La IA dispara al agua.",
        );
        setTurn(1);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [started, turn, over, received, own]);
  const shoot = (i: number) => {
    if (turn !== 1 || !started || over) return;
    const result = fire(enemy, shots, i);
    if (result) {
      setShots(result.shots);
      setMessage(
        result.sunk !== null
          ? "¡Barco enemigo hundido!"
          : result.hit
            ? "¡Tocado! Busca las casillas cercanas."
            : "Agua. Sigue buscando.",
      );
      setTurn(2);
    }
  };
  const reset = () => {
    setOwn(createFleet());
    setEnemy(createFleet());
    setShots(Array(100).fill(0));
    setReceived(Array(100).fill(0));
    setTurn(1);
    setStarted(false);
    setMessage("Localiza la flota rival.");
  };
  return (
    <GameLayout
      id="battleship"
      started={started}
      onStart={() => setStarted(true)}
      onReset={reset}
      status={
        won
          ? "¡Has hundido toda la flota rival!"
          : lost
            ? "Tu flota ha sido hundida."
            : turn === 2
              ? "La IA está buscando objetivos…"
              : message
      }
      menu={
        <button
          className="secondary full"
          onClick={() => setOwn(createFleet())}
        >
          <RefreshCw size={15} /> Reorganizar mi flota
        </button>
      }
      stats={
        <div className="score-pair">
          <span>
            Impactos tuyos <b>{shots.filter((v) => v >= 2).length}/17</b>
          </span>
          <span>
            Impactos IA <b>{received.filter((v) => v >= 2).length}/17</b>
          </span>
        </div>
      }
      rules="Cada flota tiene cinco barcos de 5, 4, 3, 3 y 2 casillas, sin superponerse. Tu flota se coloca automáticamente y puedes reorganizarla antes de empezar. Dispara por turnos en la cuadrícula rival; un impacto no da turno extra. Agua, tocado y hundido se distinguen por sus marcas. Gana quien hunda toda la flota contraria. La IA usa tus disparos conocidos, sin ver barcos ocultos."
    >
      <div className="battleship-tables">
        {[
          { title: "Aguas enemigas", s: shots, f: enemy, hidden: true },
          { title: "Tu flota", s: received, f: own, hidden: false },
        ].map(({ title, s, f, hidden }) => (
          <div key={title}>
            <h3>{title}</h3>
            <div className={"sea-grid " + (!hidden ? "own" : "")}>
              {s.map((v, i) => (
                <button
                  key={i}
                  disabled={
                    !hidden || !started || turn !== 1 || over || Boolean(v)
                  }
                  aria-label={
                    title +
                    ", " +
                    String.fromCharCode(65 + Math.floor(i / 10)) +
                    ((i % 10) + 1) +
                    ": " +
                    (v === 1
                      ? "agua"
                      : v === 2
                        ? "tocado"
                        : v === 3
                          ? "hundido"
                          : !hidden && f[i] >= 0
                            ? "barco"
                            : "sin explorar")
                  }
                  className={
                    v === 1
                      ? "miss"
                      : v === 2
                        ? "hit"
                        : v === 3
                          ? "sunk"
                          : !hidden && f[i] >= 0
                            ? "ship"
                            : ""
                  }
                  onClick={() => shoot(i)}
                >
                  {v === 1 ? (
                    "·"
                  ) : v >= 2 ? (
                    "×"
                  ) : !hidden && f[i] >= 0 ? (
                    <i />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="sea-legend">
        <span>· Agua</span>
        <span>× Tocado</span>
        <span>▣ Hundido</span>
      </div>
    </GameLayout>
  );
}
