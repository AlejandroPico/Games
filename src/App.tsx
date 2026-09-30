import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Search,
  Sun,
  Sunset,
  Moon,
  Monitor,
  Users,
  SlidersHorizontal,
  Info,
  X,
  Github,
  MapPin,
  Download,
} from "lucide-react";
import { Chess } from "chess.js";
import { games, type GameId } from "./games/registry";
import Board3D from "./games/chess/Board3D";
import GameBoundary from "./shared/GameBoundary";
import Overlay from "./shared/Overlay";
import {
  automaticTheme,
  type ThemeMode,
  type SunLocation,
} from "./shared/theme";
const ChessGame = lazy(() => import("./games/chess/ChessGame"));
const ConnectFour = lazy(() => import("./games/connect-four/ConnectFour"));
const extraGames: Partial<Record<GameId, ReturnType<typeof lazy>>> = {
  "tic-tac-toe": lazy(() => import("./games/tic-tac-toe/TicTacToe")),
  reversi: lazy(() => import("./games/reversi/Reversi")),
  checkers: lazy(() => import("./games/checkers/Checkers")),
  mancala: lazy(() => import("./games/mancala/Mancala")),
  battleship: lazy(() => import("./games/battleship/Battleship")),
  solitaire: lazy(() => import("./games/solitaire/Solitaire")),
  minesweeper: lazy(() => import("./games/minesweeper/Minesweeper")),
  sudoku: lazy(() => import("./games/sudoku/Sudoku")),
  "2048": lazy(() => import("./games/2048/Game2048")),
  memory: lazy(() => import("./games/memory/Memory")),
  go: lazy(() => import("./games/go/GoGame")),
  ludo: lazy(() => import("./games/ludo/Parchis")),
};
const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function App() {
  const [mode, setMode] = useState<ThemeMode>(() =>
      read("games-theme-mode", "auto"),
    ),
    [route, setRoute] = useState(location.hash.slice(1)),
    [query, setQuery] = useState(""),
    [categories, setCategories] = useState<string[]>([]),
    [panel, setPanel] = useState<
      "search" | "filters" | "theme" | "about" | null
    >(null),
    [now, setNow] = useState(() => new Date()),
    [solarLocation, setSolarLocation] = useState<SunLocation | undefined>(() =>
      read("games-sun-location", undefined),
    ),
    [locationNote, setLocationNote] = useState(""),
    [install, setInstall] = useState<InstallEvent | null>(null);
  const active = route.split("?")[0],
    game = games.find((g) => g.id === active),
    ExtraGame = extraGames[active as GameId];
  const theme = mode === "auto" ? automaticTheme(now, solarLocation) : mode;
  const preview = useMemo(
    () =>
      new Chess(
        "r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      ),
    [],
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.view = game ? "game" : "collection";
  }, [theme, game]);
  useEffect(() => {
    try {
      localStorage.setItem("games-theme-mode", JSON.stringify(mode));
    } catch {}
  }, [mode]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const listen = () => {
      setRoute(location.hash.slice(1));
      setPanel(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listen);
    return () => window.removeEventListener("hashchange", listen);
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    const installed = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    if (
      games.some((g) => g.id === location.hash.slice(1).split("?")[0]) &&
      !history.state?.games
    ) {
      const hash = location.hash;
      history.replaceState(
        { games: true },
        "",
        location.pathname + location.search,
      );
      history.pushState(
        { games: true },
        "",
        location.pathname + location.search + hash,
      );
    }
    const mark = () => history.replaceState({ games: true }, "", location.href);
    window.addEventListener("hashchange", mark);
    return () => window.removeEventListener("hashchange", mark);
  }, []);
  const shown = games.filter(
    (g) =>
      (!categories.length ||
        categories.some((c) => g.category === c || g.tags?.includes(c))) &&
      normalizeText(
        g.name + " " + g.category + " " + (g.tags || []).join(" "),
      ).includes(normalizeText(query)),
  );
  const toggle = (p: typeof panel) => setPanel(panel === p ? null : p);
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationNote("La ubicación no está disponible.");
      return;
    }
    setLocationNote("Buscando ubicación…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const value = {
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        };
        setSolarLocation(value);
        setNow(new Date());
        try {
          localStorage.setItem("games-sun-location", JSON.stringify(value));
        } catch {}
        setLocationNote("Amanecer y anochecer ajustados a tu ubicación.");
      },
      () => setLocationNote("Se mantiene el horario local estacional."),
      { timeout: 10000, maximumAge: 86400000 },
    );
  };
  return (
    <>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Games, inicio">
          <img src="./favicon.svg" alt="" width="36" height="36" />
          Games
        </a>
        {game && <h1 className="header-game-title">{game.name}</h1>}
        <div className="header-end">
          <button
            className={
              "icon-button " + (panel === "search" || query ? "active" : "")
            }
            aria-label="Buscar juegos"
            aria-expanded={panel === "search"}
            onClick={() => toggle("search")}
          >
            <Search size={21} />
          </button>
          <button
            className={
              "icon-button " +
              (panel === "filters" || categories.length ? "active" : "")
            }
            aria-label="Filtrar juegos"
            aria-expanded={panel === "filters"}
            onClick={() => toggle("filters")}
          >
            <SlidersHorizontal size={21} />
            {categories.length > 0 && (
              <span className="filter-badge">{categories.length}</span>
            )}
          </button>
          <button
            className="icon-button"
            aria-label="Cambiar tema"
            aria-expanded={panel === "theme"}
            onClick={() => toggle("theme")}
          >
            {mode === "auto" ? (
              <Monitor size={21} />
            ) : mode === "day" ? (
              <Sun size={21} />
            ) : mode === "afternoon" ? (
              <Sunset size={21} />
            ) : (
              <Moon size={21} />
            )}
          </button>
          <button
            className="icon-button"
            aria-label="Acerca de"
            onClick={() => toggle("about")}
          >
            <Info size={21} />
          </button>
        </div>
        {panel && panel !== "about" && (
          <div
            className={"header-popover panel-" + panel}
            role="region"
            aria-label={
              panel === "search"
                ? "Búsqueda"
                : panel === "filters"
                  ? "Filtros"
                  : "Tema"
            }
          >
            <div className="popover-heading">
              <strong>
                {panel === "search"
                  ? "Buscar juegos"
                  : panel === "filters"
                    ? "Categorías"
                    : "Iluminación"}
              </strong>
              <button
                className="icon-button"
                aria-label="Cerrar desplegable"
                onClick={() => setPanel(null)}
              >
                <X size={18} />
              </button>
            </div>
            {panel === "search" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (game) location.hash = "";
                  setPanel(null);
                }}
              >
                <input
                  autoFocus
                  aria-label="Nombre del juego"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nombre del juego"
                />
                {game && (
                  <button className="primary full" type="submit">
                    Ver resultados
                  </button>
                )}
              </form>
            )}
            {panel === "filters" && (
              <>
                <div className="category-options">
                  {[
                    ...new Set(
                      games.flatMap((g) => [g.category, ...(g.tags || [])]),
                    ),
                  ].map((c) => (
                    <label key={c}>
                      <input
                        type="checkbox"
                        checked={categories.includes(c)}
                        onChange={() =>
                          setCategories((v) =>
                            v.includes(c)
                              ? v.filter((x) => x !== c)
                              : [...v, c],
                          )
                        }
                      />
                      {c}
                    </label>
                  ))}
                </div>
                <p>Cualquiera de las categorías seleccionadas.</p>
                <div className="filter-actions">
                  <button
                    className="secondary"
                    onClick={() => setCategories([])}
                  >
                    Limpiar
                  </button>
                  <button
                    className="primary"
                    onClick={() => {
                      if (game) location.hash = "";
                      setPanel(null);
                    }}
                  >
                    Aplicar
                  </button>
                </div>
              </>
            )}
            {panel === "theme" && (
              <>
                <div className="theme-options">
                  {(
                    [
                      ["day", "Día", Sun],
                      ["afternoon", "Tarde", Sunset],
                      ["night", "Noche", Moon],
                      ["auto", "Automático", Monitor],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      className={mode === value ? "active" : ""}
                      aria-pressed={mode === value}
                      onClick={() => setMode(value)}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
                {mode === "auto" && (
                  <>
                    <p>
                      {solarLocation
                        ? "Según el sol en tu ubicación y la hora local."
                        : "Según la hora local y la estación. Horario aproximado."}
                    </p>
                    <button className="text-button" onClick={locate}>
                      <MapPin size={15} /> Ajustar con mi ubicación
                    </button>
                    {solarLocation && (
                      <button
                        className="text-button"
                        onClick={() => {
                          setSolarLocation(undefined);
                          try {
                            localStorage.removeItem("games-sun-location");
                          } catch {}
                          setLocationNote("");
                        }}
                      >
                        Olvidar ubicación
                      </button>
                    )}
                    <p role="status">{locationNote}</p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </header>
      <main className={game ? "game-main" : "collection-main"}>
        <GameBoundary key={active}>
          {active === "chess" ? (
            <Suspense
              fallback={<div className="loading">Cargando ajedrez…</div>}
            >
              <ChessGame night={theme === "night"} />
            </Suspense>
          ) : active === "connect-four" ? (
            <Suspense
              fallback={<div className="loading">Cargando Conecta 4…</div>}
            >
              <ConnectFour />
            </Suspense>
          ) : ExtraGame ? (
            <Suspense fallback={<div className="loading">Cargando juego…</div>}>
              <ExtraGame />
            </Suspense>
          ) : (
            <section className="collection" aria-label="Colección de juegos">
              {(query || categories.length > 0) && (
                <div className="active-filters">
                  <span>
                    {shown.length} juegos{query ? ' · "' + query + '"' : ""}
                    {categories.length ? " · " + categories.join(", ") : ""}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => {
                      setQuery("");
                      setCategories([]);
                    }}
                  >
                    Limpiar filtros <X size={14} />
                  </button>
                </div>
              )}
              <div className="game-grid">
                {shown.map((g) => (
                  <button
                    key={g.id}
                    className={"game-tile " + g.color}
                    onClick={() => (location.hash = g.id)}
                    aria-label={"Jugar a " + g.name}
                  >
                    <div className="tile-art">
                      {g.id === "chess" ? (
                        <Board3D
                          chess={preview}
                          night={theme === "night"}
                          decorative
                        />
                      ) : (
                        <GameArt id={g.id} />
                      )}
                    </div>
                    <span className="tile-players" title={g.players}>
                      <Users size={14} />
                      <span>
                        {g.players
                          .replace(" jugadores", "")
                          .replace(" jugador", "")}
                      </span>
                    </span>
                    <span className="tile-title">{g.name}</span>
                    <span className="tile-category">{g.category}</span>
                  </button>
                ))}
              </div>
              {!shown.length && (
                <p className="empty-state">No hay juegos con esos filtros.</p>
              )}
            </section>
          )}
        </GameBoundary>
      </main>
      {panel === "about" && (
        <Overlay
          title="Acerca de Games"
          onClose={() => setPanel(null)}
          className="site-overlay"
        >
          <p className="rules-copy">
            Una colección de juegos de mesa de Alejandro Pico. Catorce juegos
            para jugar a tu ritmo, con rivales automáticos, modos locales y
            salas privadas de ajedrez.
          </p>
          <div className="about-links">
            <a
              className="primary"
              href="https://alejandropico.github.io/Portfolio/"
              target="_blank"
              rel="noreferrer"
            >
              Portfolio
            </a>
            <a
              className="secondary"
              href="https://github.com/AlejandroPico/Games"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} /> Repositorio
            </a>
          </div>
          {install ? (
            <button
              className="secondary full"
              onClick={async () => {
                await install.prompt();
                await install.userChoice;
                setInstall(null);
              }}
            >
              <Download size={18} /> Instalar Games
            </button>
          ) : (
            <p className="rules-copy">
              Puedes instalar Games desde el menú del navegador. Una vez
              cargada, la colección también funciona sin conexión; las salas
              privadas necesitan Internet.
            </p>
          )}
          <small>
            Proyecto de código abierto · GPLv3. Stockfish 19, chess.js y
            Three.js. Cada juego indica su variante y reglas en su menú.
          </small>
        </Overlay>
      )}
    </>
  );
}

function GameArt({ id }: { id: GameId }) {
  if (
    ![
      "chess",
      "connect-four",
      "go",
      "ludo",
      "solitaire",
      "minesweeper",
    ].includes(id)
  )
    return <ExtraArt id={id} />;
  if (id === "connect-four")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <defs>
          <linearGradient id="frame" x2=".3" y2="1">
            <stop stopColor="#7999ae" />
            <stop offset="1" stopColor="#44677d" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="12" stdDeviation="8" floodOpacity=".15" />
          </filter>
        </defs>
        <g
          transform="translate(91 18) rotate(-6 110 100)"
          filter="url(#shadow)"
        >
          <rect x="4" y="10" width="214" height="165" rx="10" fill="#34566b" />
          <rect width="214" height="165" rx="10" fill="url(#frame)" />
          {Array.from({ length: 42 }, (_, i) => {
            const r = Math.floor(i / 7),
              c = i % 7;
            return (
              <circle
                key={i}
                cx={19 + c * 29.4}
                cy={18 + r * 26}
                r="10"
                fill={
                  r > 3
                    ? i % 3
                      ? "#e8b563"
                      : "#f0e7d6"
                    : r === 3 && c > 1 && c < 5
                      ? "#e8b563"
                      : "#c9d8dc"
                }
                stroke="#3b6075"
                strokeWidth="2"
              />
            );
          })}
          <rect x="-8" y="164" width="18" height="28" rx="3" fill="#466e87" />
          <rect x="204" y="164" width="18" height="28" rx="3" fill="#466e87" />
        </g>
        <circle cx="74" cy="195" r="13" fill="#e8b563" />
        <ellipse cx="316" cy="189" rx="14" ry="7" fill="#f1e8d7" />
      </svg>
    );
  if (id === "chess")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <ellipse
          cx="200"
          cy="207"
          rx="116"
          ry="12"
          fill="#466753"
          opacity=".12"
        />
        <g transform="translate(150 24)">
          <path
            d="M13 169h74l8 19H5zm8-17h58l8 15H13zm17-87h24l12 85H26z"
            fill="#f4ead6"
            stroke="#d0c2a3"
            strokeWidth="2"
          />
          <path d="M29 59h43v14H29z" fill="#dccbad" />
          <path
            d="M33 41h34v16H33z M46 7h9v35h-9z M35 19h31v9H35z"
            fill="#f4ead6"
          />
          <ellipse cx="50" cy="188" rx="46" ry="6" fill="#b5a384" />
        </g>
        <g transform="translate(75 86) scale(.7)">
          <path
            d="M13 169h74l8 19H5zm8-17h58l8 15H13zm17-87h24l12 85H26z"
            fill="#355a46"
          />
          <circle cx="50" cy="48" r="24" fill="#426b55" />
        </g>
        <g transform="translate(260 88) scale(.67)">
          <path
            d="M13 169h74l8 19H5zm8-17h58l8 15H13zm17-87h24l12 85H26z"
            fill="#355a46"
          />
          <circle cx="50" cy="48" r="24" fill="#426b55" />
        </g>
      </svg>
    );
  if (id === "go")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <defs>
          <linearGradient id="wood">
            <stop stopColor="#d3ad73" />
            <stop offset="1" stopColor="#efcf94" />
          </linearGradient>
        </defs>
        <g transform="translate(104 25) rotate(-7 100 90)">
          <rect x="0" y="8" width="200" height="180" rx="5" fill="#b78d51" />
          <rect width="200" height="178" rx="5" fill="url(#wood)" />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} stroke="#977542" strokeWidth=".7">
              <path d={`M20 ${18 + i * 18}H180 M${20 + i * 20} 18V162`} />
            </g>
          ))}
          {[
            [3, 3, 0],
            [4, 3, 1],
            [4, 4, 0],
            [3, 4, 1],
            [5, 5, 0],
            [5, 4, 1],
            [2, 4, 0],
            [6, 3, 1],
            [4, 5, 1],
            [3, 5, 0],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <ellipse
                cx={20 + x * 20}
                cy={21 + y * 18}
                rx="9"
                ry="8"
                fill="#473e30"
                opacity=".25"
              />
              <circle
                cx={20 + x * 20}
                cy={18 + y * 18}
                r="9"
                fill={c ? "#f6efdf" : "#383b35"}
              />
              <circle
                cx={17 + x * 20}
                cy={15 + y * 18}
                r="2"
                fill="white"
                opacity=".2"
              />
            </g>
          ))}
        </g>
      </svg>
    );
  if (id === "ludo")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(109 23) rotate(-9 90 90)">
          <rect x="-4" y="5" width="188" height="188" rx="8" fill="#c0a59c" />
          <rect width="180" height="180" rx="6" fill="#fff5e7" />
          {[
            [0, 0, "#ae665e"],
            [110, 0, "#d2b773"],
            [0, 110, "#80a09b"],
            [110, 110, "#7093a0"],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <rect
                x={Number(x) + 8}
                y={Number(y) + 8}
                width="54"
                height="54"
                rx="4"
                fill={String(c)}
              />
              {[
                [17, 17],
                [43, 17],
                [17, 43],
                [43, 43],
              ].map(([a, b], j) => (
                <circle
                  key={j}
                  cx={Number(x) + a + 6}
                  cy={Number(y) + b + 6}
                  r="6"
                  fill="#f5eee0"
                />
              ))}
            </g>
          ))}
          <path
            d="M72 0V180M90 0V180M108 0V180 M0 72H180 M0 90H180 M0 108H180"
            stroke="#d6c9b4"
          />
          <path d="M72 72h36v36H72z" fill="#d8bb8b" />
          <circle cx="81" cy="50" r="6" fill="#ae665e" />
          <circle cx="130" cy="81" r="6" fill="#d2b773" />
        </g>
      </svg>
    );
  if (id === "solitaire")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        {[-23, -8, 9, 24].map((angle, i) => (
          <g
            key={i}
            transform={`translate(${143 + i * 5} 36) rotate(${angle} 54 83)`}
          >
            <rect
              x="1"
              y="5"
              width="107"
              height="166"
              rx="9"
              fill="#244e3f"
              opacity=".12"
            />
            <rect
              width="107"
              height="166"
              rx="8"
              fill="#fffbf0"
              stroke="#ded9c8"
            />
            <text
              x="12"
              y="28"
              fontFamily="Georgia"
              fontSize="23"
              fill={i % 2 ? "#ab6758" : "#244e3f"}
            >
              {["J", "Q", "K", "A"][i]}
            </text>
            <text
              x="10"
              y="49"
              fontSize="20"
              fill={i % 2 ? "#ab6758" : "#244e3f"}
            >
              {["♠", "♥", "♣", "♦"][i]}
            </text>
            <text
              x="34"
              y="107"
              fontSize="50"
              fill={i % 2 ? "#ab6758" : "#244e3f"}
            >
              {["♠", "♥", "♣", "♦"][i]}
            </text>
          </g>
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 400 240" aria-hidden="true">
      <g transform="translate(119 27) rotate(-8 85 85)">
        {Array.from({ length: 25 }, (_, i) => {
          const x = (i % 5) * 33,
            y = Math.floor(i / 5) * 33;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y + 4}
                width="30"
                height="30"
                rx="4"
                fill="#89869e"
              />
              <rect
                x={x}
                y={y}
                width="30"
                height="30"
                rx="4"
                fill={i < 11 ? "#e8e5eb" : "#bbb6cf"}
              />
              {i === 17 ? (
                <g>
                  <path
                    d={`M${x + 11} ${y + 23}V6l12 5-12 5`}
                    fill="#ae6a63"
                    stroke="#685a6a"
                    strokeWidth="2"
                  />
                </g>
              ) : i < 11 && i % 3 ? (
                <text
                  x={x + 10}
                  y={y + 21}
                  fontFamily="Arial"
                  fontWeight="bold"
                  fontSize="18"
                  fill={i % 2 ? "#507c89" : "#727291"}
                >
                  {i % 2 ? 1 : 2}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function ExtraArt({ id }: { id: GameId }) {
  if (id === "tic-tac-toe")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g
          transform="translate(119 26) rotate(-8 80 80)"
          stroke="#5f796a"
          strokeWidth="7"
          strokeLinecap="round"
        >
          <path d="M53 0v170M113 0v170M0 53h170M0 113h170" opacity=".35" />
          <path
            d="M12 12l27 27m0-27L12 39 M128 127l27 27m0-27-27 27"
            stroke="#b57462"
          />
          <circle cx="82" cy="26" r="17" fill="none" />
          <circle cx="25" cy="85" r="17" fill="none" />
          <path d="M67 69l29 29m0-29L67 98" stroke="#b57462" />
          <circle cx="83" cy="143" r="17" fill="none" />
        </g>
      </svg>
    );
  if (id === "reversi" || id === "checkers")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(112 29) rotate(-7 90 90)">
          <rect width="176" height="176" rx="5" fill="#628475" />
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8),
              c = i % 8;
            return (
              <rect
                key={i}
                x={c * 22}
                y={r * 22}
                width="22"
                height="22"
                fill={
                  id === "reversi"
                    ? "none"
                    : (r + c) % 2
                      ? "#567462"
                      : "#e1d6b9"
                }
                stroke="#446653"
                strokeWidth=".5"
              />
            );
          })}
          {(id === "reversi"
            ? [
                [3, 3, 1],
                [4, 3, 0],
                [3, 4, 0],
                [4, 4, 1],
                [2, 4, 0],
                [5, 3, 1],
              ]
            : [
                [1, 1, 0],
                [3, 1, 0],
                [4, 4, 1],
                [2, 6, 1],
                [6, 6, 1],
                [3, 5, 1],
              ]
          ).map(([c, r, v], i) => (
            <g key={i}>
              <ellipse
                cx={11 + c * 22}
                cy={14 + r * 22}
                rx="10"
                ry="9"
                fill="#223b31"
                opacity=".25"
              />
              <circle
                cx={11 + c * 22}
                cy={11 + r * 22}
                r="9"
                fill={
                  v ? (id === "reversi" ? "#f6edda" : "#b4785c") : "#2f4c3f"
                }
                stroke={id === "checkers" ? "#d4bb91" : "none"}
                strokeWidth="1.5"
              />
            </g>
          ))}
        </g>
      </svg>
    );
  if (id === "mancala")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(46 56) rotate(-6 152 60)">
          <rect y="5" width="310" height="122" rx="52" fill="#af8057" />
          <rect width="310" height="120" rx="50" fill="#cca775" />
          <ellipse cx="30" cy="60" rx="17" ry="36" fill="#a37b51" />
          <ellipse cx="280" cy="60" rx="17" ry="36" fill="#a37b51" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 68 + (i % 6) * 35,
              y = 35 + Math.floor(i / 6) * 52;
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx="14" ry="17" fill="#a88152" />
                {[0, 1, 2, 3].map((j) => (
                  <circle
                    key={j}
                    cx={x - 6 + (j % 2) * 10}
                    cy={y - 5 + Math.floor(j / 2) * 10}
                    r="4"
                    fill={
                      ["#e4c783", "#789b94", "#b76e55", "#ddbd86"][(i + j) % 4]
                    }
                  />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    );
  if (id === "sudoku")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(113 25) rotate(-7 88 90)">
          <rect width="180" height="180" rx="4" fill="#fff9e9" />
          {Array.from({ length: 10 }, (_, i) => (
            <g
              key={i}
              stroke={i % 3 ? "#d5cfb6" : "#998e6c"}
              strokeWidth={i % 3 ? ".7" : "2"}
            >
              <path d={`M${i * 20} 0v180M0 ${i * 20}h180`} />
            </g>
          ))}
          {Array.from({ length: 81 }, (_, i) =>
            i % 4 === 0 ? (
              <text
                key={i}
                x={(i % 9) * 20 + 6}
                y={Math.floor(i / 9) * 20 + 14}
                fontSize="12"
                fill="#5c705b"
              >
                {((Math.floor(i / 9) * 3 +
                  Math.floor(Math.floor(i / 9) / 3) +
                  (i % 9)) %
                  9) +
                  1}
              </text>
            ) : null,
          )}
        </g>
      </svg>
    );
  if (id === "2048")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(110 24) rotate(-7 90 90)">
          <rect width="182" height="182" rx="9" fill="#b5a38b" />
          {[2, 4, 0, 2, 8, 16, 4, 0, 0, 32, 64, 4, 2, 0, 128, 256].map(
            (n, i) => (
              <g key={i}>
                <rect
                  x={8 + (i % 4) * 43}
                  y={8 + Math.floor(i / 4) * 43}
                  width="38"
                  height="38"
                  rx="4"
                  fill={
                    n
                      ? n < 8
                        ? "#ede2c9"
                        : n < 32
                          ? "#d9ae76"
                          : "#bd815d"
                      : "#c6b7a1"
                  }
                />
                {n ? (
                  <text
                    x={27 + (i % 4) * 43}
                    y={32 + Math.floor(i / 4) * 43}
                    textAnchor="middle"
                    fill={n < 8 ? "#776c55" : "#fff3d9"}
                    fontSize={n < 100 ? "19" : "14"}
                    fontWeight="bold"
                  >
                    {n}
                  </text>
                ) : null}
              </g>
            ),
          )}
        </g>
      </svg>
    );
  if (id === "memory")
    return (
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <g transform="translate(97 34) rotate(-6 100 90)">
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <rect
                x={(i % 3) * 70}
                y={Math.floor(i / 3) * 87}
                width="58"
                height="76"
                rx="7"
                fill={i === 1 || i === 4 ? "#fff8e5" : "#a7a0b9"}
                stroke="#94869f"
              />
              <text
                x={29 + (i % 3) * 70}
                y={49 + Math.floor(i / 3) * 87}
                textAnchor="middle"
                fontFamily="Georgia"
                fontSize="32"
                fill={i === 1 || i === 4 ? "#a46e63" : "#eae1e7"}
              >
                {i === 1 || i === 4 ? "♥" : "g."}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  return (
    <svg viewBox="0 0 400 240" aria-hidden="true">
      <g transform="translate(108 24) rotate(-7 90 90)">
        <rect width="180" height="180" rx="5" fill="#719bab" />
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 18} 0v180M0 ${i * 18}h180`}
            stroke="#c7dade"
            strokeWidth=".5"
          />
        ))}
        <rect x="36" y="54" width="72" height="18" rx="5" fill="#365d70" />
        <rect x="126" y="108" width="18" height="54" rx="5" fill="#365d70" />
        {[
          [3, 3],
          [4, 3],
          [7, 7],
        ].map(([c, r], i) => (
          <text
            key={i}
            x={c * 18 + 3}
            y={r * 18 + 15}
            fontSize="20"
            fill="#e2aa80"
          >
            ×
          </text>
        ))}
      </g>
    </svg>
  );
}
