import { initialFive, playFive, bestFive } from "../../shared/fiveInRow";
export const initial = () => initialFive(15);
export const play = playFive;
export const bestMove = bestFive;
