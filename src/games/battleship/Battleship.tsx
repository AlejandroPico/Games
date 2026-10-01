import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { RefreshCw } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import { createFleet, fire, defeated, target, lengths } from "./rules";
export default function Battleship() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [own, setOwn] = useRoomState("own", createFleet),
    [enemy, setEnemy] = useRoomState("enemy", createFleet),
    [shots, setShots] = useRoomState<number[]>("shots", Array(100).fill(0)),
    [received, setReceived] = useRoomState<number[]>(
      "received",
      Array(100).fill(0),
    ),
    [turn, setTurn] = useRoomState("turn", 1),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [revealed, setRevealed] = useRoomState("revealed", ""),
    [started, setStarted] = useRoomState("started", false),
    [message, setMessage] = useRoomState("message", "Localiza la flota rival.");
  const won = defeated(enemy, shots),
    lost = defeated(own, received),
    over = won || lost,
    ai = watching || room.machine(turn - 1, mode === "ai" && turn === 2),
    perspective = mode === "local" ? turn : 1,
    privacyKey = `${turn}:${shots.filter(Boolean).length}:${received.filter(Boolean).length}`,
    visible =
      mode !== "local" ||
      room.online ||
      watching ||
      !started ||
      over ||
      revealed === privacyKey;
  useAutoplay(
    started && !over && ai,
    turn === 1 ? shots : received,
    () => {
      const fleet = turn === 1 ? enemy : own,
        visible = turn === 1 ? shots : received;
      const remaining = lengths.filter(
        (_, id) =>
          !fleet
            .map((v, i) => (v === id ? i : -1))
            .filter((i) => i !== -1)
            .every((i) => visible[i] === 3),
      );
      const result = fire(fleet, visible, target(visible, remaining));
      if (result) {
        if (turn === 1) setShots(result.shots);
        else setReceived(result.shots);
        setTurn(3 - turn);
        setMessage(
          result.sunk !== null
            ? "Barco hundido."
            : result.hit
              ? "Tocado."
              : "Agua.",
        );
      }
    },
    450,
  );
  const shoot = (i: number) => {
    if (ai || !started || over) return;
    const result = fire(
      turn === 1 ? enemy : own,
      turn === 1 ? shots : received,
      i,
    );
    if (result) {
      if (turn === 1) setShots(result.shots);
      else setReceived(result.shots);
      setMessage(
        result.sunk !== null
          ? "¡Barco enemigo hundido!"
          : result.hit
            ? "¡Tocado! Busca las casillas cercanas."
            : "Agua. Sigue buscando.",
      );
      setTurn(3 - turn);
    }
  };
  const reset = () => {
    setOwn(createFleet());
    setEnemy(createFleet());
    setShots(Array(100).fill(0));
    setReceived(Array(100).fill(0));
    setTurn(1);
    setRevealed("");
    setStarted(false);
    setMessage("Localiza la flota rival.");
  };
  return (
    <GameLayout
      roomTurn={turn - 1}
      privateTable={!over}
      id="battleship"
      mode={mode}
      setMode={setMode}
      started={started}
      onStart={() => setStarted(true)}
      onReset={reset}
      controls={
        !visible && (
          <button onClick={() => setRevealed(privacyKey)}>
            Mostrar mesa del jugador {turn}
          </button>
        )
      }
      status={
        won
          ? "El jugador 1 ha hundido toda la flota rival."
          : lost
            ? "El jugador 2 ha hundido toda la flota rival."
            : ai
              ? "La IA está buscando objetivos…"
              : "Jugador " + turn + " · " + message
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
            Impactos jugador 1 <b>{shots.filter((v) => v >= 2).length}/17</b>
          </span>
          <span>
            Impactos jugador 2 <b>{received.filter((v) => v >= 2).length}/17</b>
          </span>
        </div>
      }
      rules="Cada flota tiene cinco barcos de 5, 4, 3, 3 y 2 casillas, sin superponerse. Tu flota se coloca automáticamente y puedes reorganizarla antes de empezar. Dispara por turnos en la cuadrícula rival; un impacto no da turno extra. Agua, tocado y hundido se distinguen por sus marcas. Gana quien hunda toda la flota contraria. La IA usa tus disparos conocidos, sin ver barcos ocultos."
    >
      {visible ? (
        <div className="battleship-tables">
          {[
            {
              title: "Aguas enemigas",
              s: perspective === 1 ? shots : received,
              f: perspective === 1 ? enemy : own,
              hidden: true,
            },
            {
              title: "Tu flota",
              s: perspective === 1 ? received : shots,
              f: perspective === 1 ? own : enemy,
              hidden: false,
            },
          ].map(({ title, s, f, hidden }) => (
            <div key={title}>
              <h3>{title}</h3>
              <div className={"sea-grid " + (!hidden ? "own" : "")}>
                {s.map((v, i) => (
                  <button
                    key={i}
                    disabled={!hidden || !started || ai || over || Boolean(v)}
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
      ) : (
        <p className="stage-caption">
          Entrega el dispositivo al jugador {turn} antes de mostrar su flota.
        </p>
      )}
      <div className="sea-legend">
        <span>· Agua</span>
        <span>× Tocado</span>
        <span>▣ Hundido</span>
      </div>
    </GameLayout>
  );
}
