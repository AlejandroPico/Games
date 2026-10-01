import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import GameLayout from "../../shared/GameLayout";
import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { initial, play, swap } from "./rules";
export default function Hex() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [size, setSize] = useRoomState("size", 9),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [started, setStarted] = useRoomState("started", false);
  const ai =
    watching || room.machine(state.turn - 1, mode === "ai" && state.turn === 2);
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && !state.winner,
    (a: number | "swap") =>
      setState((s) => (a === "swap" ? swap(s) : play(s, a)) || s),
  );
  return (
    <GameLayout
      roomTurn={state.turn - 1}
      id="hex"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial(size));
        setStarted(true);
      }}
      menu={
        <label className="field-label">
          Tablero
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[7, 9, 11].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      }
      status={
        error ||
        (state.winner
          ? "Gana el jugador " + state.winner
          : busy
            ? "La IA piensa…"
            : "Jugador " +
              state.turn +
              " · " +
              (state.colors[state.turn - 1] === 1
                ? "coral: arriba ↔ abajo"
                : "azul: izquierda ↔ derecha"))
      }
      controls={
        state.moves === 1 &&
        !state.swapped && (
          <button disabled={ai} onClick={() => setState((s) => swap(s) || s)}>
            Intercambiar bandos
          </button>
        )
      }
      rules="Une con tus hexágonos los dos bordes de tu color. Los seis lados de cada celda determinan la vecindad; las piedras no se mueven ni se capturan. Tras la primera piedra, el segundo jugador puede quedarse con ese bando: cambia la propiedad de los colores y el primero vuelve a jugar. Hex no tiene empates."
    >
      <div className="hex-table">
        <div className="hex-top">CORAL</div>
        <div className="hex-rows">
          {Array.from({ length: state.size }, (_, r) => (
            <div
              className="hex-row"
              key={r}
              style={{ marginLeft: r * 1.7 + "em" }}
            >
              {Array.from({ length: state.size }, (_, c) => {
                const i = r * state.size + c,
                  v = state.board[i];
                return (
                  <button
                    className={v === 1 ? "coral" : v === 2 ? "blue" : ""}
                    key={c}
                    aria-label={
                      "Hexágono " +
                      (r + 1) +
                      ", " +
                      (c + 1) +
                      (v ? ", " + (v === 1 ? "coral" : "azul") : "")
                    }
                    disabled={!started || ai || !!state.winner || !!v}
                    onClick={() => setState((s) => play(s, i) || s)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="hex-bottom">
          CORAL · AZUL conecta los bordes laterales
        </div>
      </div>
    </GameLayout>
  );
}
