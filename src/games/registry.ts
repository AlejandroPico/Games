import { roadmapGames } from "./roadmap";
export type PlayableGameId =
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
  | "memory"
  | "damas-internacionales"
  | "shogi-ajedrez-japones"
  | "xiangqi-ajedrez-chino"
  | "solitario-spider"
  | "solitario-carta-blanca-freecell"
  | "blackjack-21"
  | "mus"
  | "brisca"
  | "mahjong-solitario"
  | "yahtzee-la-generala"
  | "mastermind"
  | "quarto"
  | "el-ahorcado"
  | "cruzapalabras"
  | "basta-tutti-frutti"
  | "adivina-la-palabra"
  | "cajas-timbiriche-dots-and-boxes"
  | "gomoku"
  | "palabras-encadenadas"
  | "conecta-5-pente"
  | "el-diccionario"
  | "hex"
  | "sprouts-brotes"
  | "colonizadores"
  | "backgammon";
export type GameId = PlayableGameId | (typeof roadmapGames)[number]["id"];
export interface GameInfo {
  id: GameId;
  name: string;
  subtitle: string;
  category: string;
  tags?: readonly string[];
  players: string;
  duration: string;
  ready: boolean;
  color: string;
}
const enabledGames: Record<string, Partial<GameInfo>> = {
  "damas-chinas": {
    name: "Damas Chinas",
    players: "2–6 jugadores",
    ready: true,
  },
  chaturanga: {
    name: "Chaturanga",
    players: "1–2 jugadores",
    subtitle: "Una reconstrucción del ajedrez ancestral para dos bandos.",
    ready: true,
  },
  patolli: {
    name: "Patolli",
    players: "2–4 jugadores",
    subtitle: "Una carrera de piedras y frijoles: reconstrucción recreativa.",
    ready: true,
  },
  "rutas-de-vapor": {
    name: "Rutas de Vapor",
    players: "2–4 jugadores",
    subtitle: "Conecta ciudades y contratos en una adaptación original.",
    ready: true,
  },
  "draft-de-maravillas": {
    name: "Draft de Maravillas",
    players: "3–4 jugadores",
    subtitle: "Tres eras de cartas y ciudades: variante original.",
    ready: true,
  },
  "reserva-de-naturaleza": {
    name: "Reserva de Naturaleza",
    players: "2–4 jugadores",
    subtitle: "Hábitats, animales y conservación en una variante original.",
    ready: true,
  },
  "construccion-de-castillos": {
    name: "Construcción de Castillos",
    players: "2–4 jugadores",
    subtitle: "Dados, losetas y dominios en una variante original.",
    ready: true,
  },
  escoba: { name: "Escoba", players: "2–4 jugadores", ready: true },
  cinquillo: { name: "Cinquillo", players: "2–4 jugadores", ready: true },
  belote: { name: "Belote", players: "4 jugadores", ready: true },
  "futbol-de-mesa-con-cartas": {
    name: "Fútbol de mesa con cartas",
    players: "1–2 jugadores",
    subtitle: "Duelo original de ataque y defensa con cartas.",
    ready: true,
  },
  "buscaminas-hexagonal": {
    name: "Buscaminas Hexagonal",
    players: "1 jugador",
    ready: true,
  },
  "torres-de-hanoi": {
    name: "Torres de Hanói",
    players: "1 jugador",
    ready: true,
  },
  "sopa-de-letras-dinamica": {
    name: "Sopa de Letras Dinámica",
    players: "1 jugador",
    ready: true,
  },
  inu: {
    name: "Inu",
    players: "1–2 jugadores",
    subtitle: "Deducción de posiciones ocultas: variante original de Games.",
    ready: true,
  },
  "mensajes-cruzados": {
    name: "Mensajes Cruzados",
    players: "4 jugadores",
    subtitle: "Pistas y códigos por equipos: variante original.",
    ready: true,
  },
  santorini: { name: "Santorini", players: "1–2 jugadores", ready: true },
  "el-ahorcado": { name: "El Ahorcado", players: "1 jugador", ready: true },
  cruzapalabras: {
    name: "CruzaPalabras",
    players: "1–2 jugadores",
    ready: true,
  },
  "basta-tutti-frutti": {
    name: "Basta / Tutti Frutti",
    players: "1–2 jugadores",
    ready: true,
  },
  "adivina-la-palabra": {
    name: "Adivina la Palabra",
    players: "1 jugador",
    ready: true,
  },
  "cajas-timbiriche-dots-and-boxes": {
    name: "Cajas / Timbiriche",
    players: "1–2 jugadores",
    ready: true,
  },
  gomoku: { name: "Gomoku", players: "1–2 jugadores", ready: true },
  "palabras-encadenadas": {
    name: "Palabras Encadenadas",
    players: "1–2 jugadores",
    ready: true,
  },
  "conecta-5-pente": {
    name: "Conecta 5 / Pente",
    players: "1–2 jugadores",
    ready: true,
  },
  "el-diccionario": {
    name: "El Diccionario",
    players: "1–4 jugadores",
    ready: true,
  },
  hex: { name: "Hex", players: "1–2 jugadores", ready: true },
  "sprouts-brotes": {
    name: "Sprouts / Brotes",
    players: "1–2 jugadores",
    ready: true,
  },
  colonizadores: {
    name: "Colonizadores",
    players: "1–4 jugadores",
    ready: true,
  },
  backgammon: { name: "Backgammon", players: "1–2 jugadores", ready: true },
  "damas-internacionales": {
    name: "Damas internacionales",
    players: "1–2 jugadores",
    ready: true,
  },
  "shogi-ajedrez-japones": {
    name: "Shogi",
    players: "1–2 jugadores",
    ready: true,
  },
  "xiangqi-ajedrez-chino": {
    name: "Xiangqi",
    players: "1–2 jugadores",
    ready: true,
  },
  "solitario-spider": {
    name: "Spider",
    players: "1 jugador",
    ready: true,
  },
  "solitario-carta-blanca-freecell": {
    name: "Carta Blanca",
    players: "1 jugador",
    ready: true,
  },
  "blackjack-21": {
    name: "Blackjack",
    players: "1 jugador + IA",
    ready: true,
  },
  mus: {
    name: "Mus",
    players: "1–4 jugadores",
    ready: true,
  },
  brisca: {
    name: "Brisca",
    players: "1–2 jugadores",
    ready: true,
  },
  "mahjong-solitario": {
    name: "Mahjong solitario",
    players: "1 jugador",
    ready: true,
  },
  "yahtzee-la-generala": {
    name: "Yahtzee",
    players: "1–2 jugadores",
    ready: true,
  },
  mastermind: {
    name: "Mastermind",
    players: "1–2 jugadores",
    ready: true,
  },
  quarto: {
    name: "Quarto",
    players: "1–2 jugadores",
    ready: true,
  },
};
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
    name: "Damas americanas",
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
    players: "1–2 jugadores",
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
  ...roadmapGames.map((g) => ({ ...g, ...(enabledGames[g.id] || {}) })),
];
