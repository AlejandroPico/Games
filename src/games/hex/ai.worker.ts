import { bestMove } from "./rules";
self.onmessage = (e) => self.postMessage(bestMove(e.data));
