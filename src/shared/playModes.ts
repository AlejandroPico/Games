import { games } from "../games/registry";
/** Single-player puzzles have no independent human opponent. The blackjack bank follows fixed rules. */
export const individualGames = new Set<string>([
  "nonogramas-picross",
  "crucigramas-interactivos",
  "bloques-deslizantes",
  "puzle-de-tuberias",
  "cruces-numericos-kakuro",
  "rutas-de-luces-lights-out",
  "puentes-fluviales-hashiwokakero",
  "laberintos-generativos",
  "buscaminas-hexagonal",
  "torres-de-hanoi",
  "sopa-de-letras-dinamica",
  "solitaire",
  "minesweeper",
  "sudoku",
  "2048",
  "solitario-spider",
  "solitario-carta-blanca-freecell",
  "blackjack-21",
  "mahjong-solitario",
  "el-ahorcado",
  "adivina-la-palabra",
]);
export function supportsFriends(id: string) {
  return games.some((g) => g.id === id && g.ready) && !individualGames.has(id);
}
export function supportsTableRoom(id: string) {
  return id !== "chess" && supportsFriends(id);
}
