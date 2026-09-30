export type GameId =
  | "chess"
  | "connect-four"
  | "go"
  | "ludo"
  | "solitaire"
  | "minesweeper"
  | "tic-tac-toe"
  | "reversi"
  | "checkers"
  | "mancala"
  | "battleship"
  | "sudoku"
  | "2048"
  | "memory";
export interface GameInfo {
  id: GameId;
  name: string;
  subtitle: string;
  category: string;
  tags?: string[];
  players: string;
  duration: string;
  ready: boolean;
  color: string;
}
export const games: GameInfo[] = [
  {
    id: "chess",
    name: "Ajedrez",
    subtitle: "Cada movimiento cuenta.",
    category: "Estrategia",
    players: "1–2 jugadores",
    duration: "A tu ritmo",
    ready: true,
    color: "sage",
  },
  {
    id: "connect-four",
    name: "Conecta 4",
    subtitle: "Una línea. Mil posibilidades.",
    category: "Clásicos",
    players: "1–2 jugadores",
    duration: "5–10 min",
    ready: true,
    color: "blue",
  },
  {
    id: "tic-tac-toe",
    name: "Tres en raya",
    subtitle: "Tres casillas. Una buena idea.",
    category: "Clásicos",
    tags: ["Familia"],
    players: "1–2 jugadores",
    duration: "2–5 min",
    ready: true,
    color: "rose",
  },
  {
    id: "reversi",
    name: "Reversi",
    subtitle: "Cambia el color de la partida.",
    category: "Estrategia",
    players: "1–2 jugadores",
    duration: "15–25 min",
    ready: true,
    color: "mint",
  },
  {
    id: "checkers",
    name: "Damas",
    subtitle: "Salta hacia tu próxima victoria.",
    category: "Estrategia",
    players: "1–2 jugadores",
    duration: "10–20 min",
    ready: true,
    color: "sand",
  },
  {
    id: "mancala",
    name: "Mancala",
    subtitle: "Una estrategia milenaria.",
    category: "Tradicionales",
    players: "1–2 jugadores",
    duration: "10–20 min",
    ready: true,
    color: "sand",
  },
  {
    id: "battleship",
    name: "Batalla naval",
    subtitle: "Un océano de posibilidades.",
    category: "Deducción",
    players: "1 jugador + IA",
    duration: "10–20 min",
    ready: true,
    color: "blue",
  },
  {
    id: "solitaire",
    name: "Solitario",
    subtitle: "Un pequeño momento para ti.",
    category: "Cartas",
    players: "1 jugador",
    duration: "10–15 min",
    ready: true,
    color: "mint",
  },
  {
    id: "minesweeper",
    name: "Buscaminas",
    subtitle: "La lógica es tu mejor pista.",
    category: "Lógica",
    players: "1 jugador",
    duration: "5–15 min",
    ready: true,
    color: "lavender",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    subtitle: "Cada número tiene su lugar.",
    category: "Lógica",
    players: "1 jugador",
    duration: "10–30 min",
    ready: true,
    color: "sand",
  },
  {
    id: "2048",
    name: "2048",
    subtitle: "Una suma pequeña. Un reto enorme.",
    category: "Puzles",
    players: "1 jugador",
    duration: "5–20 min",
    ready: true,
    color: "rose",
  },
  {
    id: "memory",
    name: "Parejas",
    subtitle: "Recuerda. Encuentra. Conecta.",
    category: "Memoria",
    tags: ["Familia"],
    players: "1–2 jugadores",
    duration: "5–10 min",
    ready: true,
    color: "lavender",
  },
  {
    id: "go",
    name: "Go",
    subtitle: "El arte de conquistar espacio.",
    category: "Estrategia",
    players: "1–2 jugadores",
    duration: "30–60 min",
    ready: true,
    color: "sand",
  },
  {
    id: "ludo",
    name: "Parchís",
    subtitle: "El clásico que nos reúne.",
    category: "Familia",
    players: "2–4 jugadores",
    duration: "20–40 min",
    ready: true,
    color: "rose",
  },
];
