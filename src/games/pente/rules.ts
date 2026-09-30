import { initialFive, playFive, bestFive } from "../../shared/fiveInRow";
export const initial = () => initialFive(19, true);
export const play = playFive;
export const bestMove = bestFive;
