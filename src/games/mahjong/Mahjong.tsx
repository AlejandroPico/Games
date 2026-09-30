import { useObservation, useAutoplay } from "../../shared/Observation";
import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { initial, free, match, hint, arrange, type Tile } from "./rules";
import MahjongFace from "./MahjongFace";
export default function Mahjong() {
  const { watching } = useObservation();
  const [tiles, setTiles] = useState(() => initial()),
    [started, setStarted] = useState(false),
    [selection, setSelection] = useState<number[]>([]),
    [history, setHistory] = useState<Tile[][]>([]),
    [message, setMessage] = useState("");
  const left = tiles.filter((t) => !t.removed).length,
    win = !left;
  const choose = (id: number) => {
    if (selection.length === 1 && selection[0] !== id) {
      const n = match(tiles, selection[0], id);
      if (n) {
        setHistory((h) => [...h, tiles]);
        setTiles(n);
        setSelection([]);
        setMessage("");
        return;
      }
    }
    setSelection([id]);
  };
  useAutoplay(started && watching && !win, tiles, () => {
    const pair = hint(tiles);
    if (pair) {
      const next = match(tiles, pair[0], pair[1]);
      if (next) setTiles(next);
    } else
      setMessage("La IA se detuvo: no hay parejas libres. Puedes reiniciar.");
  });
  return (
    <GameLayout
      id="mahjong-solitario"
      started={started}
      onStart={() => {
        setTiles(initial());
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setSelection([]);
        setHistory([]);
        setMessage("");
      }}
      status={
        win
          ? "¡La mesa está despejada!"
          : message ||
            (!hint(tiles)
              ? "No hay parejas libres · deshaz o reordena"
              : "Encuentra dos fichas iguales y libres.")
      }
      stats={<span className="small-score">{left} fichas</span>}
      controls={
        <>
          <button
            disabled={!history.length}
            onClick={() => {
              setTiles(history.at(-1)!);
              setHistory((h) => h.slice(0, -1));
              setSelection([]);
              setMessage("");
            }}
          >
            Deshacer
          </button>
          <button
            disabled={win}
            onClick={() => {
              const h = hint(tiles);
              setSelection(h || []);
              setMessage(
                h ? "Pareja libre señalada." : "No quedan parejas libres.",
              );
            }}
          >
            Pista
          </button>
          <button
            disabled={win}
            onClick={() => {
              try {
                const n = arrange(tiles);
                setHistory((h) => [...h, tiles]);
                setTiles(n);
                setSelection([]);
                setMessage("Fichas restantes reordenadas con solución.");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          >
            Reordenar
          </button>
        </>
      }
      rules="Mahjong solitario, disposición de tortuga de 144 fichas. Una ficha está libre si no la cubre otra y tiene al menos un lado horizontal abierto. Retira parejas iguales. Todas las flores combinan entre sí y todas las estaciones combinan entre sí; el resto debe coincidir exactamente. La repartición inicial se construye con una solución, aunque tus elecciones pueden bloquearla. Pistas señalan una pareja legal; deshacer recupera la última pareja. Reordenar redistribuye las caras restantes con una solución manteniendo los huecos cuando la geometría lo permite. Es un solitario de parejas, no el mahjong de cuatro jugadores."
    >
      <div className="mahjong-table">
        {tiles
          .filter((t) => !t.removed)
          .map((t) => (
            <button
              key={t.id}
              className={
                "mahjong-tile " + (selection.includes(t.id) ? "selected" : "")
              }
              aria-label={
                "Ficha " +
                (t.face + 1) +
                " en capa " +
                t.z +
                (free(tiles, t) ? ", libre" : ", bloqueada")
              }
              disabled={!started || !free(tiles, t)}
              style={{
                left:
                  "calc(" + ((t.x + 1) * 100) / 15 + "% + " + t.z * 2 + "px)",
                top: "calc(" + (t.y * 100) / 8 + "% - " + t.z * 3 + "px)",
                zIndex: 10 + t.z,
              }}
              onClick={() => choose(t.id)}
            >
              <MahjongFace face={t.face} />
            </button>
          ))}
      </div>
    </GameLayout>
  );
}
