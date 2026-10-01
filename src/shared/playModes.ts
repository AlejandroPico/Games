import { games } from "../games/registry";
/** Single-player puzzles have no independent human opponent. The blackjack bank follows fixed rules. */
export const individualGames = new Set<string>([
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
