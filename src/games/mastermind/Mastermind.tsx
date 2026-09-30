import { useEffect, useMemo, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { feedback, secret, type Row } from "./rules";
const colors = ["Coral", "Azul", "Verde", "Ocre", "Violeta", "Marfil"];
export default function Mastermind() {
  const [started, setStarted] = useState(false),
    [role, setRole] = useState("breaker"),
    [repeats, setRepeats] = useState(true),
    [chosen, setChosen] = useState([0, 1, 2, 3]),
    [code, setCode] = useState(() => secret()),
    [history, setHistory] = useState<Row[]>([]),
    [guess, setGuess] = useState<(number | null)[]>(Array(4).fill(null)),
    [slot, setSlot] = useState(0),
    [help, setHelp] = useState(false),
    [pending, setPending] = useState<number[] | null>(null),
    [message, setMessage] = useState("");
  const won = history.at(-1)?.exact === 4,
    over = won || history.length === 10,
    input = useMemo(() => ({ history, repeats }), [history, repeats]);
  const { busy, error } = useAI(
    Worker,
    input,
    started && !over && !pending && (role === "maker" || help),
    (next: number[] | null) => {
      setHelp(false);
      if (!next) {
        setMessage("No queda ningún código compatible.");
        return;
      }
      if (role === "maker") setPending(next);
      else {
        setGuess(next);
        setMessage(
          "Sugerencia calculada únicamente con las pistas anteriores.",
        );
      }
    },
  );
  useEffect(() => {
    if (!pending || !started) return;
    const timer = setTimeout(() => {
      setHistory((h) => [...h, { guess: pending, ...feedback(code, pending) }]);
      setPending(null);
    }, 650);
    return () => clearTimeout(timer);
  }, [pending, started, code]);
  const submit = () => {
    if (guess.some((v) => v === null)) return;
    if (!repeats && new Set(guess).size < 4) {
      setMessage("Esta partida no permite colores repetidos.");
      return;
    }
    const gs = guess as number[];
    setHistory((h) => [...h, { guess: gs, ...feedback(code, gs) }]);
    setGuess(Array(4).fill(null));
    setSlot(0);
    setMessage("");
  };
  const validCode = repeats || new Set(chosen).size === 4;
  return (
    <GameLayout
      id="mastermind"
      started={started}
      onStart={() => {
        if (!validCode && role === "maker") {
          setMessage("El código debe usar colores distintos.");
          return;
        }
        setCode(role === "maker" ? [...chosen] : secret(repeats));
        setStarted(true);
        setMessage("");
      }}
      onReset={() => {
        setStarted(false);
        setHistory([]);
        setGuess(Array(4).fill(null));
        setSlot(0);
        setHelp(false);
        setPending(null);
        setMessage("");
      }}
      menu={
        <>
          <label className="field-label">
            Modo
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="breaker">Descifrar el código</option>
              <option value="maker">Crear un código para la IA</option>
            </select>
          </label>
          <label className="field-label">
            Colores
            <select
              value={repeats ? "yes" : "no"}
              onChange={(e) => setRepeats(e.target.value === "yes")}
            >
              <option value="yes">Se pueden repetir</option>
              <option value="no">Todos distintos</option>
            </select>
          </label>
          {role === "maker" && (
            <div className="code-config">
              {chosen.map((c, i) => (
                <label key={i}>
                  Color {i + 1}
                  <select
                    value={c}
                    onChange={(e) =>
                      setChosen((s) =>
                        s.map((v, j) => (j === i ? Number(e.target.value) : v)),
                      )
                    }
                  >
                    {colors.map((name, n) => (
                      <option key={n} value={n}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          {message && <p>{message}</p>}
        </>
      }
      status={
        error ||
        (won
          ? "¡Código resuelto!"
          : over
            ? "Se agotaron los intentos."
            : busy
              ? "La IA está analizando las pistas…"
              : message ||
                "Negro: color y posición. Blanco: color en otra posición.")
      }
      controls={
        role === "breaker" ? (
          <>
            <button
              disabled={over || busy || guess.some((v) => v === null)}
              onClick={submit}
            >
              Comprobar
            </button>
            <button disabled={over || busy} onClick={() => setHelp(true)}>
              Sugerencia de IA
            </button>
          </>
        ) : (
          <span>La IA solo recibe las pistas de sus intentos.</span>
        )
      }
      rules="Mastermind: un código de cuatro posiciones con seis colores. Puedes configurar si se repiten. Cada intento recibe puntos negros por color y posición exactos, y blancos por colores que están en otra posición; los puntos no indican qué casilla acertaste. Un color no se cuenta dos veces. Tienes diez intentos. Pulsa una posición y después un color. Sugerencia usa únicamente tus intentos previos. En Crear código para la IA, seleccionas el secreto en los ajustes y el rival lo deduce sin recibirlo: prueba códigos compatibles y reduce el peor grupo de candidatos. El código se revela al finalizar."
    >
      <div
        className={
          "mastermind-table" + (role === "maker" || over ? " readonly" : "")
        }
      >
        <div
          className="secret-code"
          aria-label={
            over || role === "maker"
              ? "Código secreto visible"
              : "Código secreto oculto"
          }
        >
          {code.map((c, i) => (
            <span
              key={i}
              className={
                "code-peg " +
                (over || role === "maker" ? "peg-" + c : "concealed")
              }
            >
              {over || role === "maker" ? "" : "?"}
            </span>
          ))}
        </div>
        <div className="code-history">
          {Array.from({ length: 10 }, (_, i) => {
            const row = history[i];
            return (
              <div key={i} className="code-row">
                <small>{i + 1}</small>
                <div>
                  {Array.from({ length: 4 }, (_, j) => (
                    <span
                      key={j}
                      className={
                        "code-peg " + (row ? "peg-" + row.guess[j] : "empty")
                      }
                    />
                  ))}
                </div>
                <div
                  className="code-feedback"
                  aria-label={
                    row
                      ? row.exact +
                        " exactos, " +
                        row.near +
                        " en otra posición"
                      : "Sin pistas"
                  }
                >
                  {Array.from({ length: 4 }, (_, j) => (
                    <i
                      key={j}
                      className={
                        row && j < row.exact
                          ? "exact"
                          : row && j < row.exact + row.near
                            ? "near"
                            : ""
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {role === "breaker" && !over && (
          <>
            <div className="code-draft">
              {guess.map((v, i) => (
                <button
                  key={i}
                  disabled={busy}
                  aria-label={
                    "Posición " +
                    (i + 1) +
                    ": " +
                    (v === null ? "sin color" : colors[v])
                  }
                  aria-pressed={slot === i}
                  className={
                    "code-peg " +
                    (v === null ? "empty" : "peg-" + v) +
                    (slot === i ? " active" : "")
                  }
                  onClick={() => setSlot(i)}
                />
              ))}
            </div>
            <div className="code-palette">
              {colors.map((name, c) => (
                <button
                  key={c}
                  aria-label={"Elegir " + name}
                  disabled={busy}
                  className={"code-peg peg-" + c}
                  onClick={() => {
                    setGuess((g) => g.map((v, i) => (i === slot ? c : v)));
                    setSlot((s) => (s + 1) % 4);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
