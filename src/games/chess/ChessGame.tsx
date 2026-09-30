import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Square, type PieceSymbol, type Color } from "chess.js";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Flag,
  Download,
  Upload,
  Copy,
  Check,
  Bot,
  Users,
  Globe,
  ChevronDown,
  Volume2,
  VolumeX,
  Info,
  X,
} from "lucide-react";
import Board3D from "./Board3D";
import Overlay from "../../shared/Overlay";
import QuickRestart from "../../shared/QuickRestart";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { Settings2 } from "lucide-react";
import { ChessEngine, type Level } from "./engine";
import {
  automaticOutcome,
  drawClaim,
  pieceNames,
  timeoutOutcome,
  resignationOutcome,
  type Outcome,
} from "./rules";
import { RoomPeer, type WireMessage } from "./network";

type Mode = "ai" | "local" | "online";
type Config = {
  mode: Mode;
  color: Color;
  level: Level;
  minutes: number;
  increment: number;
};
type Save = {
  version: 1;
  pgn: string;
  config: Config;
  clocks: Record<Color, number>;
  outcome: Outcome | null;
};
const symbols: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};
const format = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
function readSave(): Save | null {
  try {
    const value = JSON.parse(
      localStorage.getItem("games-chess-save-v1") || "null",
    );
    if (value?.version !== 1 || !["ai", "local"].includes(value.config?.mode))
      return null;
    new Chess().loadPgn(value.pgn);
    if (
      !["w", "b"].includes(value.config.color) ||
      !["beginner", "club", "expert", "master"].includes(value.config.level) ||
      ![0, 3, 5, 10, 15].includes(value.config.minutes) ||
      ![0, 2, 3, 5, 10].includes(value.config.increment) ||
      !Number.isFinite(value.clocks?.w) ||
      !Number.isFinite(value.clocks?.b)
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export default function ChessGame({ night }: { night: boolean }) {
  const [settings, setSettings] = useState(false);
  const [restartOffer, setRestartOffer] = useState<"sent" | "received" | null>(
    null,
  );

  const [chess, setChess] = useState(() => new Chess()),
    [revision, setRevision] = useState(0),
    [phase, setPhase] = useState<"menu" | "play">("menu");
  const [config, setConfig] = useState<Config>({
      mode: "ai",
      color: "w",
      level: "club",
      minutes: 0,
      increment: 0,
    }),
    [view, setView] = useState<"3d" | "2d">("3d"),
    [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<Square | null>(null),
    [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(
      null,
    ),
    [outcome, setOutcome] = useState<Outcome | null>(null);
  const [thinking, setThinking] = useState(false),
    [error, setError] = useState(""),
    [sound, setSound] = useState(false),
    [rules, setRules] = useState(false),
    [confirm, setConfirm] = useState<"resign" | "new" | null>(null);
  const [clocks, setClocks] = useState<Record<Color, number>>({ w: 0, b: 0 }),
    [claimMode, setClaimMode] = useState(false),
    [offer, setOffer] = useState<"sent" | "received" | null>(null);
  const [save, setSave] = useState(readSave),
    [roomCode, setRoomCode] = useState(""),
    [roomStatus, setRoomStatus] = useState(""),
    [connected, setConnected] = useState(false),
    [roomHost, setRoomHost] = useState(false),
    [copied, setCopied] = useState(false);
  const engine = useRef<ChessEngine | null>(null),
    room = useRef<RoomPeer | null>(null),
    audio = useRef<AudioContext | null>(null),
    lastTick = useRef(performance.now()),
    state = useRef({
      chess,
      config,
      outcome,
      connected,
      offer,
      phase,
      restartOffer,
    });
  const clocksRef = useRef(clocks);
  state.current = {
    chess,
    config,
    outcome,
    connected,
    offer,
    phase,
    restartOffer,
  };
  clocksRef.current = clocks;
  useEffect(
    () => () => {
      engine.current?.destroy();
      room.current?.destroy();
      void audio.current?.close();
    },
    [],
  );
  useEffect(() => {
    if (phase === "play" && config.mode !== "online") {
      try {
        const payload: Save = {
          version: 1,
          pgn: chess.pgn(),
          config,
          clocks: clocksRef.current,
          outcome,
        };
        localStorage.setItem("games-chess-save-v1", JSON.stringify(payload));
      } catch {}
    }
  }, [revision, phase, config, outcome, chess]);
  const beep = () => {
    if (!sound) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const oscillator = audio.current.createOscillator(),
        gain = audio.current.createGain();
      oscillator.connect(gain);
      gain.connect(audio.current.destination);
      oscillator.frequency.value = chess.isCheck() ? 600 : 330;
      gain.gain.setValueAtTime(0.04, audio.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.current.currentTime + 0.1,
      );
      oscillator.start();
      oscillator.stop(audio.current.currentTime + 0.1);
    } catch {}
  };
  const refresh = () => {
    setRevision((r) => r + 1);
    setSelected(null);
    setClaimMode(false);
    setOutcome(automaticOutcome(chess));
    beep();
  };
  const apply = useCallback(
    (from: Square, to: Square, promote: PieceSymbol = "q", remote = false) => {
      const s = state.current;
      if (s.outcome || s.phase !== "play") return;
      if (
        s.config.mode === "online" &&
        (!s.connected ||
          (remote
            ? s.chess.turn() === s.config.color
            : s.chess.turn() !== s.config.color))
      )
        return;
      const before = s.chess.fen(),
        ply = s.chess.history().length,
        mover = s.chess.turn();
      try {
        s.chess.move({ from, to, promotion: promote });
        if (s.config.minutes) {
          const elapsed = performance.now() - lastTick.current;
          const remaining = clocksRef.current[mover] - elapsed;
          if (remaining <= 0) {
            s.chess.undo();
            setOutcome(timeoutOutcome(s.chess, mover));
            return;
          }
          setClocks((c) => ({
            ...c,
            [mover]: remaining + s.config.increment * 1000,
          }));
          lastTick.current = performance.now();
        }
        if (s.config.mode === "online" && !remote)
          room.current?.send({
            v: 1,
            type: "move",
            from,
            to,
            promotion: promote,
            before,
            ply,
          });
        setError("");
        setOffer(null);
        setRevision((r) => r + 1);
        setSelected(null);
        setClaimMode(false);
        setPromotion(null);
        setOutcome(automaticOutcome(s.chess));
      } catch {
        setError("Ese movimiento no es legal. Elige una casilla marcada.");
      }
    },
    [],
  );
  useEffect(() => {
    if (
      phase !== "play" ||
      outcome ||
      config.mode !== "ai" ||
      chess.turn() === config.color
    )
      return;
    let cancelled = false;
    const instance = new ChessEngine();
    engine.current = instance;
    setThinking(true);
    setError("");
    const history = chess.history({ verbose: true });
    const uci = history.map((m) => m.from + m.to + (m.promotion || ""));
    instance
      .move(chess.fen(), config.level, uci)
      .then((move) => {
        if (cancelled) return;
        if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))
          throw new Error("Stockfish no ha devuelto una jugada válida.");
        apply(
          move.slice(0, 2) as Square,
          move.slice(2, 4) as Square,
          (move[4] || "q") as PieceSymbol,
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setThinking(false);
      });
    return () => {
      cancelled = true;
      instance.destroy();
      engine.current = null;
    };
  }, [revision, phase, config, chess, outcome, apply]);
  useEffect(() => {
    if (phase !== "play" || outcome || !config.minutes) return;
    lastTick.current = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(),
        delta = now - lastTick.current;
      lastTick.current = now;
      const turn = state.current.chess.turn();
      setClocks((c) => {
        const next = { ...c, [turn]: Math.max(0, c[turn] - delta) };
        clocksRef.current = next;
        if (next[turn] === 0)
          setOutcome(timeoutOutcome(state.current.chess, turn));
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase, outcome, config.minutes, chess]);
  useEffect(() => {
    if (phase !== "play" || config.mode === "online") return;
    const persist = () => {
      try {
        localStorage.setItem(
          "games-chess-save-v1",
          JSON.stringify({
            version: 1,
            pgn: chess.pgn(),
            config,
            clocks: clocksRef.current,
            outcome,
          }),
        );
      } catch {}
    };
    window.addEventListener("pagehide", persist);
    return () => {
      persist();
      window.removeEventListener("pagehide", persist);
    };
  }, [phase, chess, config, outcome]);
  const start = (chosen = config) => {
    engine.current?.destroy();
    room.current?.destroy();
    room.current = null;
    setConnected(false);
    const next = new Chess();
    next.setHeader("Event", "Games · Ajedrez");
    next.setHeader(
      "White",
      chosen.mode === "ai" && chosen.color === "b"
        ? "Stockfish 19"
        : "Jugador 1",
    );
    next.setHeader(
      "Black",
      chosen.mode === "ai" && chosen.color === "w"
        ? "Stockfish 19"
        : "Jugador 2",
    );
    setChess(next);
    setConfig(chosen);
    setClocks({ w: chosen.minutes * 60000, b: chosen.minutes * 60000 });
    setOutcome(null);
    setSelected(null);
    setPromotion(null);
    setOffer(null);
    setError("");
    setThinking(false);
    setFlipped(chosen.color === "b");
    setPhase("play");
    setSettings(false);
    setRestartOffer(null);
    setRevision((r) => r + 1);
    lastTick.current = performance.now();
  };
  const resume = () => {
    if (!save) return;
    try {
      const next = new Chess();
      next.loadPgn(save.pgn);
      setChess(next);
      setConfig(save.config);
      setClocks(save.clocks);
      setOutcome(save.outcome || automaticOutcome(next));
      setPhase("play");
      setFlipped(save.config.color === "b");
      lastTick.current = performance.now();
      setRevision((r) => r + 1);
    } catch {
      setError("No se ha podido recuperar la partida.");
    }
  };
  const restartRoom = () => {
    const next = new Chess();
    next.setHeader("Event", "Games · Sala privada");
    setChess(next);
    setOutcome(null);
    setSelected(null);
    setPromotion(null);
    setOffer(null);
    setRestartOffer(null);
    setClaimMode(false);
    setError("");
    setSettings(false);
    setPhase("play");
    setRevision((r) => r + 1);
  };
  const requestRestart = () => {
    if (!connected || restartOffer) return;
    room.current?.send({
      v: 1,
      type: "restart",
      before: chess.fen(),
      ply: chess.history().length,
    });
    setRestartOffer("sent");
  };
  const receive = (m: WireMessage) => {
    const s = state.current;
    if (s.phase !== "play" || s.config.mode !== "online" || !s.connected)
      return;
    if (m.type === "restart-no") {
      setRestartOffer(null);
      return;
    }
    if (m.type === "restart" || m.type === "restart-ok") {
      if (m.before !== s.chess.fen() || m.ply !== s.chess.history().length) {
        room.current?.send({ v: 1, type: "restart-no" });
        return;
      }
      if (m.type === "restart-ok") {
        if (s.restartOffer === "sent") restartRoom();
      } else if (s.restartOffer === "sent") {
        room.current?.send({
          v: 1,
          type: "restart-ok",
          before: s.chess.fen(),
          ply: s.chess.history().length,
        });
        restartRoom();
      } else setRestartOffer("received");
      return;
    }
    if (s.outcome) return;
    if (m.type === "move") {
      if (
        m.before !== s.chess.fen() ||
        m.ply !== s.chess.history().length ||
        typeof m.from !== "string" ||
        typeof m.to !== "string"
      )
        return;
      apply(
        m.from as Square,
        m.to as Square,
        (m.promotion || "q") as PieceSymbol,
        true,
      );
    } else if (m.type === "resign")
      setOutcome(
        resignationOutcome(s.chess, s.config.color === "w" ? "b" : "w"),
      );
    else if (m.type === "offer") setOffer("received");
    else if (m.type === "accept" && s.offer === "sent") {
      setOutcome({ result: "1/2-1/2", reason: "Tablas por acuerdo" });
      setOffer(null);
    } else if (m.type === "decline") setOffer(null);
    else if (
      m.type === "claim" &&
      s.chess.turn() !== s.config.color &&
      m.before === s.chess.fen()
    ) {
      const reason = drawClaim(
        s.chess,
        m.from && m.to
          ? {
              from: m.from as Square,
              to: m.to as Square,
              promotion: (m.promotion || "q") as PieceSymbol,
            }
          : undefined,
      );
      if (reason) setOutcome({ result: "1/2-1/2", reason });
    }
  };
  const receiveRef = useRef(receive);
  receiveRef.current = receive;
  const openRoom = (host: boolean) => {
    const code = host
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()
      : roomCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(code)) {
      setRoomStatus("Introduce el código de 8 caracteres de tu amigo.");
      return;
    }
    room.current?.destroy();
    setRoomCode(code);
    setRoomHost(host);
    setConnected(false);
    const chosen: Config = {
      ...config,
      mode: "online",
      color: host ? "w" : "b",
      minutes: 0,
      increment: 0,
    };
    setConfig(chosen);
    room.current = new RoomPeer(
      code,
      host,
      setRoomStatus,
      () => {
        const next = new Chess();
        next.setHeader("Event", "Games · Sala privada");
        setChess(next);
        setOutcome(null);
        setSelected(null);
        setOffer(null);
        setRestartOffer(null);
        setSettings(false);
        setConnected(true);
        setPhase("play");
        setFlipped(!host);
        setError("");
        setRevision((r) => r + 1);
      },
      (m) => receiveRef.current(m),
      () => setConnected(false),
    );
  };
  const sendClaim = (intended?: {
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
  }) => {
    const reason = drawClaim(chess, intended);
    if (!reason) {
      setError("Esa jugada todavía no permite reclamar tablas.");
      setClaimMode(false);
      setSelected(null);
      return;
    }
    room.current?.send({
      v: 1,
      type: "claim",
      before: chess.fen(),
      ...intended,
    });
    setOutcome({ result: "1/2-1/2", reason });
    setSelected(null);
    setPromotion(null);
    setClaimMode(false);
  };
  const ownTurn = config.mode === "local" || chess.turn() === config.color;
  const canPlay =
    phase === "play" &&
    !outcome &&
    !thinking &&
    !restartOffer &&
    ownTurn &&
    (config.mode !== "online" || connected);
  const square = (sq: Square) => {
    if (!canPlay) return;
    if (selected) {
      const moves = chess
        .moves({ square: selected, verbose: true })
        .filter((m) => m.to === sq);
      if (moves.length) {
        if (moves.some((m) => m.promotion)) {
          setPromotion({ from: selected, to: sq });
          return;
        }
        if (claimMode) {
          sendClaim({ from: selected, to: sq });
          return;
        }
        apply(selected, sq);
        beep();
        return;
      }
    }
    setSelected(chess.get(sq)?.color === chess.turn() ? sq : null);
  };
  const dropPiece = (from: Square, to: Square) => {
    if (!canPlay || chess.get(from)?.color !== chess.turn()) return false;
    const legalMoves = chess
      .moves({ square: from, verbose: true })
      .filter((m) => m.to === to);
    if (!legalMoves.length) return false;
    if (legalMoves.some((m) => m.promotion)) setPromotion({ from, to });
    else if (claimMode) sendClaim({ from, to });
    else {
      apply(from, to);
      beep();
    }
    return true;
  };
  const drag = usePieceDrag<Square>({
    canDrag: (from) => canPlay && chess.get(from)?.color === chess.turn(),
    onStart: (from) => setSelected(from),
    elements: (_from, e) => [e.querySelector<HTMLElement>(".chess-piece")!],
    onDrop: (from, e) =>
      e ? dropPiece(from, e.dataset.drop as Square) : false,
  });
  const undo = () => {
    if (config.mode === "online" || !chess.history().length) return;
    engine.current?.destroy();
    engine.current = null;
    setThinking(false);
    if (config.mode === "ai" && chess.turn() === config.color) chess.undo();
    chess.undo();
    setOffer(null);
    refresh();
  };
  const exportPGN = () => {
    chess.setHeader("Result", outcome?.result || "*");
    const blob = new Blob([chess.pgn()], { type: "application/x-chess-pgn" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "games-ajedrez.pgn";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importPGN = async (file: File) => {
    if (file.size > 200000) {
      setError("La partida es demasiado grande. Máximo 200 KB.");
      return;
    }
    try {
      const pgn = await file.text(),
        next = new Chess();
      next.loadPgn(pgn);
      engine.current?.destroy();
      room.current?.destroy();
      room.current = null;
      setChess(next);
      setConfig({ ...config, mode: "local", minutes: 0, increment: 0 });
      setConnected(false);
      setSelected(null);
      setPromotion(null);
      setOutcome(automaticOutcome(next));
      setPhase("play");
      setError("");
      setRevision((r) => r + 1);
    } catch {
      setError("El archivo PGN no contiene una partida válida.");
    }
  };
  const legal = selected
    ? chess.moves({ square: selected, verbose: true }).map((m) => m.to)
    : [];
  const history = chess.history({ verbose: true }),
    last = history.at(-1),
    claim = drawClaim(chess);
  const status = outcome
    ? outcome.reason
    : config.mode === "online" && !connected
      ? "Partida detenida · rival desconectado"
      : thinking
        ? "Stockfish está pensando…"
        : chess.isCheck()
          ? "Jaque · protege tu rey"
          : chess.turn() === "w"
            ? "Juegan blancas"
            : "Juegan negras";
  const label = (color: Color) =>
    config.mode === "ai"
      ? color === config.color
        ? "Tú"
        : "Stockfish 19"
      : config.mode === "online"
        ? color === config.color
          ? "Tú"
          : "Tu rival"
        : color === "w"
          ? "Jugador 1"
          : "Jugador 2";
  const captured = (color: Color) =>
    history
      .filter((m) => m.color === color && m.captured)
      .map((m) => symbols[(color === "w" ? "b" : "w") + m.captured])
      .join(" ");
  useEffect(() => {
    if (phase === "play") setSettings(false);
  }, [phase]);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1],
    files = flipped ? "hgfedcba" : "abcdefgh";
  return (
    <div className="game-page">
      <div className="chess-layout game-surface chess-surface">
        <div className="surface-bar">
          <div role="status">
            {phase === "menu"
              ? "Elige cómo jugar"
              : outcome?.reason ||
                (thinking
                  ? "Stockfish está pensando…"
                  : chess.turn() === "w"
                    ? "Juegan blancas"
                    : "Juegan negras")}
          </div>
          <div>
            <button
              className="icon-button"
              aria-label="Ajustes de partida"
              onClick={() => {
                setPhase("menu");
                setSettings(false);
              }}
            >
              <Settings2 size={20} />
            </button>
            {phase === "play" && (
              <button
                className="icon-button"
                aria-label="Acciones e historial"
                onClick={() => setSettings(true)}
              >
                <ChevronDown size={20} />
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Cómo jugar"
              onClick={() => setRules(true)}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
        <section className={"table-stage " + (night ? "night" : "")}>
          <div
            className={
              "player-bar " +
              (phase === "play" &&
              chess.turn() === (flipped ? "w" : "b") &&
              !outcome
                ? "turn"
                : "")
            }
          >
            <span className="player-avatar">
              {config.mode === "ai" &&
              (flipped ? "w" : "b") !== config.color ? (
                <Bot size={21} />
              ) : (
                <Users size={21} />
              )}
            </span>
            <div>
              <strong>{label(flipped ? "w" : "b")}</strong>
              <small>
                {flipped ? "Blancas" : "Negras"}{" "}
                <span>{captured(flipped ? "w" : "b")}</span>
              </small>
            </div>
            {phase === "play" && config.minutes > 0 ? (
              <b className="clock">{format(clocks[flipped ? "w" : "b"])}</b>
            ) : (
              <span className="piece-indicator">{flipped ? "○" : "●"}</span>
            )}
          </div>
          {view === "3d" ? (
            <Board3D
              chess={chess}
              selected={selected}
              legal={legal}
              onSquare={square}
              onMove={dropPiece}
              canDrag={(from) =>
                canPlay && chess.get(from)?.color === chess.turn()
              }
              onDragStart={(from) => setSelected(from)}
              flipped={flipped}
              night={night}
              lastMove={last}
            />
          ) : (
            <div className="flat-board-wrap">
              <div
                className="flat-board"
                role="group"
                aria-label="Tablero de ajedrez 2D"
              >
                {ranks.flatMap((rank, r) =>
                  Array.from(files).map((file, c) => {
                    const sq = (file + rank) as Square,
                      p = chess.get(sq),
                      check =
                        p?.type === "k" &&
                        p.color === chess.turn() &&
                        chess.isCheck();
                    return (
                      <button
                        key={sq}
                        {...drag.bind(sq)}
                        data-drop={sq}
                        data-draggable={p ? "" : undefined}
                        onClick={() => {
                          if (!drag.suppressClick()) square(sq);
                        }}
                        aria-label={
                          sq +
                          (p
                            ? " " +
                              pieceNames[p.type] +
                              " " +
                              (p.color === "w" ? "blanco" : "negro")
                            : " vacía")
                        }
                        aria-pressed={selected === sq}
                        className={
                          "square " +
                          ((file.charCodeAt(0) + rank) % 2 ? "light" : "dark") +
                          (selected === sq ? " selected" : "") +
                          (last && (last.from === sq || last.to === sq)
                            ? " last"
                            : "") +
                          (check ? " check" : "")
                        }
                      >
                        {c === 0 && <span className="rank">{rank}</span>}
                        {r === 7 && <span className="file">{file}</span>}
                        {p && (
                          <span className={"chess-piece " + p.color}>
                            {symbols[p.color + p.type]}
                          </span>
                        )}
                        {legal.includes(sq) && (
                          <span
                            className={"legal-dot " + (p ? "capture" : "")}
                          />
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          )}
          <div
            className={
              "player-bar " +
              (phase === "play" &&
              chess.turn() === (flipped ? "b" : "w") &&
              !outcome
                ? "turn"
                : "")
            }
          >
            <span className="player-avatar light-piece">
              {config.mode === "ai" &&
              (flipped ? "b" : "w") !== config.color ? (
                <Bot size={21} />
              ) : (
                <Users size={21} />
              )}
            </span>
            <div>
              <strong>{label(flipped ? "b" : "w")}</strong>
              <small>
                {flipped ? "Negras" : "Blancas"}{" "}
                <span>{captured(flipped ? "b" : "w")}</span>
              </small>
            </div>
            {phase === "play" && config.minutes > 0 ? (
              <b className="clock">{format(clocks[flipped ? "b" : "w"])}</b>
            ) : (
              <span className="piece-indicator">{flipped ? "●" : "○"}</span>
            )}
          </div>
          <div className="board-toolbar">
            <span>
              <span className="tiny-dot" />
              {view === "3d"
                ? "Iluminación " + (night ? "nocturna" : "de día")
                : "Tablero clásico"}
            </span>
            <div>
              <button
                className="icon-button"
                onClick={() => setFlipped(!flipped)}
                title="Girar tablero"
                aria-label="Girar tablero"
              >
                <RefreshCw size={17} />
              </button>
              <button
                className="icon-button"
                onClick={() => setSound(!sound)}
                title={sound ? "Silenciar" : "Activar sonido"}
                aria-label={sound ? "Silenciar" : "Activar sonido"}
              >
                {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
            </div>
          </div>
        </section>
        {phase === "play" && (
          <QuickRestart
            onRestart={() =>
              config.mode === "online" ? requestRestart() : start(config)
            }
            disabled={
              config.mode === "online" && (!connected || Boolean(restartOffer))
            }
          />
        )}
        {(phase === "menu" || settings) && (
          <Overlay
            title="Ajustes de partida"
            onClose={() => {
              if (phase === "menu") location.hash = "";
              else setSettings(false);
            }}
          >
            <div className="game-sidebar">
              <div className="view-controls">
                <button
                  className={view === "3d" ? "active" : ""}
                  onClick={() => setView("3d")}
                >
                  Vista 3D
                </button>
                <button
                  className={view === "2d" ? "active" : ""}
                  onClick={() => setView("2d")}
                >
                  Vista 2D
                </button>
                <button onClick={() => setFlipped(!flipped)}>
                  Girar tablero
                </button>
                <button onClick={() => setSound(!sound)}>
                  {sound ? "Desactivar sonido" : "Activar sonido"}
                </button>
              </div>
              {phase === "menu" ? (
                <>
                  <div className="eyebrow">TU PRÓXIMA PARTIDA</div>
                  <h2>Haz tu primera jugada.</h2>
                  <p className="muted">Elige cómo quieres jugar.</p>
                  <div className="mode-selector">
                    {[
                      {
                        id: "ai",
                        icon: Bot,
                        title: "Contra la IA",
                        sub: "Un rival a tu altura",
                      },
                      {
                        id: "local",
                        icon: Users,
                        title: "Dos jugadores",
                        sub: "Comparte el tablero",
                      },
                      {
                        id: "online",
                        icon: Globe,
                        title: "Con un amigo",
                        sub: "Sala privada por código",
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        className={config.mode === m.id ? "selected" : ""}
                        onClick={() => {
                          room.current?.destroy();
                          room.current = null;
                          setRoomStatus("");
                          setConfig({ ...config, mode: m.id as Mode });
                        }}
                      >
                        <m.icon size={21} />
                        <span>
                          <strong>{m.title}</strong>
                          <small>{m.sub}</small>
                        </span>
                        <span className="radio" />
                      </button>
                    ))}
                  </div>
                  {config.mode === "ai" && (
                    <>
                      <label className="field-label">
                        Dificultad
                        <select
                          value={config.level}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              level: e.target.value as Level,
                            })
                          }
                        >
                          <option value="beginner">
                            Principiante · primeros pasos
                          </option>
                          <option value="club">Club · un buen desafío</option>
                          <option value="expert">
                            Experto · estrategia profunda
                          </option>
                          <option value="master">
                            Maestro · máxima fuerza
                          </option>
                        </select>
                      </label>
                      <div className="field-label">
                        Tus piezas
                        <div className="segmented">
                          <button
                            className={config.color === "w" ? "active" : ""}
                            onClick={() => setConfig({ ...config, color: "w" })}
                          >
                            ○ Blancas
                          </button>
                          <button
                            className={config.color === "b" ? "active" : ""}
                            onClick={() => setConfig({ ...config, color: "b" })}
                          >
                            ● Negras
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {config.mode !== "online" ? (
                    <>
                      <label className="field-label">
                        Ritmo de juego
                        <select
                          value={config.minutes + "+" + config.increment}
                          onChange={(e) => {
                            const [minutes, increment] = e.target.value
                              .split("+")
                              .map(Number);
                            setConfig({ ...config, minutes, increment });
                          }}
                        >
                          <option value="0+0">Sin reloj · a tu ritmo</option>
                          <option value="3+2">Blitz · 3 min + 2 s</option>
                          <option value="5+3">Blitz · 5 min + 3 s</option>
                          <option value="10+5">Rápida · 10 min + 5 s</option>
                          <option value="15+10">Rápida · 15 min + 10 s</option>
                        </select>
                      </label>
                      <button className="primary full" onClick={() => start()}>
                        Empezar partida <ArrowRight size={18} />
                      </button>
                      {save && (
                        <button className="text-button full" onClick={resume}>
                          Continuar partida guardada
                        </button>
                      )}
                      <small className="setup-note">
                        Movimientos legales · enroque · captura al paso ·
                        promoción
                      </small>
                    </>
                  ) : (
                    <div className="room-panel">
                      <p>
                        El anfitrión juega con blancas. Ambos deben mantener
                        esta página abierta. Las salas no tienen reloj.
                      </p>
                      <button
                        className="primary full"
                        onClick={() => openRoom(true)}
                      >
                        Crear sala privada <ArrowRight size={17} />
                      </button>
                      <label className="field-label">
                        Código de tu amigo
                        <input
                          aria-label="Código de sala"
                          value={roomCode}
                          maxLength={8}
                          onChange={(e) =>
                            setRoomCode(e.target.value.toUpperCase())
                          }
                          placeholder="8 CARACTERES"
                        />
                      </label>
                      <button
                        className="secondary full"
                        onClick={() => openRoom(false)}
                      >
                        Unirme a una sala
                      </button>
                      {roomStatus && (
                        <div className="room-status" role="status">
                          <strong>{roomHost && roomCode}</strong>
                          <p>{roomStatus}</p>
                          {roomHost && roomCode && (
                            <button
                              className="text-button"
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(roomCode)
                                  .then(() => {
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                  })
                                  .catch(() =>
                                    setRoomStatus(
                                      "Copia el código que aparece arriba.",
                                    ),
                                  );
                              }}
                            >
                              {copied ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}{" "}
                              Copiar código
                            </button>
                          )}
                        </div>
                      )}
                      <small>
                        Conexión directa con señalización PeerJS. Algunas redes
                        pueden bloquearla.
                      </small>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="eyebrow">
                    {config.mode === "ai"
                      ? "TÚ CONTRA STOCKFISH"
                      : config.mode === "online"
                        ? "SALA " + roomCode
                        : "PARTIDA LOCAL"}
                  </div>
                  <h2>
                    {outcome
                      ? "Partida terminada."
                      : "La partida está en juego."}
                  </h2>
                  <div
                    className={"game-status " + (outcome ? "finished" : "")}
                    role="status"
                  >
                    <span className="status-dot" />
                    {status}
                    {outcome && (
                      <strong>
                        {outcome.result === "1/2-1/2"
                          ? "½ — ½"
                          : outcome.result === "1-0"
                            ? "1 — 0"
                            : "0 — 1"}
                      </strong>
                    )}
                  </div>
                  {error && (
                    <div className="error" role="alert">
                      {error}
                      {config.mode === "ai" && (
                        <button onClick={() => setRevision((r) => r + 1)}>
                          Reintentar IA
                        </button>
                      )}
                    </div>
                  )}
                  <div className="move-heading">
                    <strong>Movimientos</strong>
                    <span>{Math.ceil(history.length / 2)} jugadas</span>
                  </div>
                  <div className="move-history">
                    {!history.length ? (
                      <p>Tu historia empieza con la primera jugada.</p>
                    ) : (
                      Array.from(
                        { length: Math.ceil(history.length / 2) },
                        (_, i) => (
                          <div key={i}>
                            <span>{i + 1}.</span>
                            <b>{history[i * 2].san}</b>
                            <b
                              className={
                                i * 2 + 1 === history.length - 1 ? "latest" : ""
                              }
                            >
                              {history[i * 2 + 1]?.san || "—"}
                            </b>
                          </div>
                        ),
                      )
                    )}
                  </div>
                  {!outcome && (
                    <>
                      <p className="play-tip">
                        {claimMode
                          ? "Selecciona la jugada con la que reclamarás tablas."
                          : "Selecciona una pieza y después una casilla marcada."}
                      </p>
                      <div className="game-actions">
                        <button
                          disabled={
                            config.mode === "online" ||
                            !history.length ||
                            config.minutes > 0
                          }
                          onClick={undo}
                          title="Disponible en partidas de práctica sin reloj"
                        >
                          <RotateCcw size={16} /> Deshacer
                        </button>
                        <button
                          onClick={() => setConfirm("resign")}
                          disabled={config.mode === "online" && !connected}
                        >
                          <Flag size={16} /> Abandonar
                        </button>
                      </div>
                      <div className="draw-actions">
                        <button
                          disabled={!canPlay}
                          onClick={() =>
                            claim ? sendClaim() : setClaimMode(!claimMode)
                          }
                        >
                          {claim
                            ? "Reclamar tablas"
                            : claimMode
                              ? "Cancelar reclamación"
                              : "Reclamar con jugada"}
                        </button>
                        <button
                          disabled={
                            (config.mode === "online" && !connected) ||
                            offer === "sent"
                          }
                          onClick={() => {
                            if (config.mode === "ai") {
                              setError(
                                "Stockfish continúa la partida. Puedes reclamar tablas cuando se cumpla la regla.",
                              );
                              return;
                            }
                            setOffer(
                              config.mode === "local" ? "received" : "sent",
                            );
                            room.current?.send({ v: 1, type: "offer" });
                          }}
                        >
                          Ofrecer tablas
                        </button>
                      </div>
                    </>
                  )}
                  {offer && (
                    <div className="room-status">
                      <p>
                        {offer === "sent"
                          ? "Esperando respuesta a tu oferta de tablas."
                          : "Oferta de tablas: el rival decide."}
                      </p>
                      {offer === "received" && (
                        <div className="game-actions">
                          <button
                            onClick={() => {
                              room.current?.send({ v: 1, type: "accept" });
                              setOutcome({
                                result: "1/2-1/2",
                                reason: "Tablas por acuerdo",
                              });
                              setOffer(null);
                            }}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => {
                              room.current?.send({ v: 1, type: "decline" });
                              setOffer(null);
                            }}
                          >
                            Continuar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    className="primary full"
                    onClick={() =>
                      outcome ? setPhase("menu") : setConfirm("new")
                    }
                  >
                    Nueva partida <ArrowRight size={17} />
                  </button>
                  <div className="file-actions">
                    <button onClick={exportPGN}>
                      <Download size={14} /> Exportar PGN
                    </button>
                    {config.mode !== "online" && (
                      <label>
                        <Upload size={14} /> Importar PGN
                        <input
                          type="file"
                          accept=".pgn,text/plain"
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              void importPGN(e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {config.mode === "online" && <small>{roomStatus}</small>}
                </>
              )}
              {phase === "menu" && error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
            </div>
          </Overlay>
        )}
      </div>
      {restartOffer && connected && (
        <Overlay
          title="Otra partida"
          onClose={() => {
            room.current?.send({ v: 1, type: "restart-no" });
            setRestartOffer(null);
          }}
          className="site-overlay"
        >
          <p className="rules-copy">
            {restartOffer === "sent"
              ? "Esperando a que tu rival acepte otra partida."
              : "Tu rival propone empezar otra partida con los mismos colores y ajustes."}
          </p>
          {restartOffer === "received" && (
            <button
              className="primary full"
              onClick={() => {
                room.current?.send({
                  v: 1,
                  type: "restart-ok",
                  before: chess.fen(),
                  ply: chess.history().length,
                });
                restartRoom();
              }}
            >
              Empezar otra partida
            </button>
          )}
        </Overlay>
      )}
      {promotion && (
        <div className="modal-backdrop">
          <div
            className="modal compact"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-title"
          >
            <div className="eyebrow">UN NUEVO COMIENZO</div>
            <h2 id="promotion-title">Promociona tu peón</h2>
            <p>Elige cualquiera de estas cuatro piezas.</p>
            <div className="promotion-options">
              {(["q", "r", "b", "n"] as PieceSymbol[]).map((p) => (
                <button
                  autoFocus={p === "q"}
                  key={p}
                  onClick={() =>
                    claimMode
                      ? sendClaim({ ...promotion, promotion: p })
                      : apply(promotion.from, promotion.to, p)
                  }
                  aria-label={"Promocionar a " + pieceNames[p]}
                >
                  <span>{symbols[chess.turn() + p]}</span>
                  {pieceNames[p]}
                </button>
              ))}
            </div>
            <button className="text-button" onClick={() => setPromotion(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {confirm && (
        <div className="modal-backdrop">
          <div
            className="modal compact"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title">
              {confirm === "resign"
                ? "¿Abandonar la partida?"
                : "¿Empezar otra partida?"}
            </h2>
            <p>
              {confirm === "resign"
                ? "Se registrará el abandono y el resultado de la partida."
                : "Puedes exportar tu partida antes de empezar de nuevo."}
            </p>
            <div className="game-actions">
              <button autoFocus onClick={() => setConfirm(null)}>
                Seguir jugando
              </button>
              <button
                onClick={() => {
                  if (confirm === "resign") {
                    room.current?.send({ v: 1, type: "resign" });
                    const loser =
                      config.mode === "local" ? chess.turn() : config.color;
                    setOutcome(resignationOutcome(chess, loser));
                  } else {
                    room.current?.destroy();
                    room.current = null;
                    setPhase("menu");
                    setSave(readSave());
                  }
                  setConfirm(null);
                }}
              >
                {confirm === "resign" ? "Abandonar" : "Nueva partida"}
              </button>
            </div>
          </div>
        </div>
      )}
      {rules && (
        <div className="modal-backdrop" onClick={() => setRules(false)}>
          <div
            className="modal rules-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              onClick={() => setRules(false)}
              aria-label="Cerrar reglas"
            >
              <X />
            </button>
            <div className="eyebrow">64 CASILLAS, UN OBJETIVO</div>
            <h2 id="rules-title">Cómo jugar al ajedrez</h2>
            <p>
              Da jaque mate al rey rival. Selecciona una pieza para ver sus
              movimientos legales; después, elige su destino. Puedes cambiar
              entre las vistas 3D y 2D en cualquier momento.
            </p>
            <dl>
              <dt>Movimientos especiales</dt>
              <dd>
                Enroque corto y largo cuando el rey no está en jaque y no cruza
                casillas atacadas. Captura al paso inmediatamente después de un
                avance doble. Promoción a dama, torre, alfil o caballo.
              </dd>
              <dt>Finales de partida</dt>
              <dd>
                Jaque mate, abandono y pérdida por tiempo. Ahogado y material
                insuficiente terminan en tablas. La quíntuple repetición y 75
                movimientos sin captura ni movimiento de peón producen tablas
                automáticas; el mate tiene prioridad.
              </dd>
              <dt>Reclamar tablas</dt>
              <dd>
                La triple repetición y 50 movimientos permiten reclamar, no
                terminan la partida automáticamente. Usa «Reclamar con jugada»
                para indicar el movimiento que completaría la condición. Las
                posiciones muertas excepcionales con bloqueos se pueden resolver
                mediante una oferta de tablas.
              </dd>
              <dt>Reloj y práctica</dt>
              <dd>
                El reloj comienza al iniciar la partida. El incremento se añade
                tras cada jugada. Deshacer está disponible en prácticas sin
                reloj. El guardado es local a este navegador; al salir, las
                partidas locales se pausan.
              </dd>
              <dt>Jugar con amigos</dt>
              <dd>
                Crea una sala y comparte su código. Tu amigo elige «Unirme a una
                sala». Las salas privadas no tienen reloj; no se pueden
                recuperar tras cerrar la página y una desconexión detiene el
                juego.
              </dd>
            </dl>
            <a
              href="https://handbook.fide.com/chapter/e012023"
              target="_blank"
              rel="noreferrer"
              className="text-button"
            >
              Consultar las reglas FIDE <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
