import { bestMove } from './rules';
self.onmessage = (event:MessageEvent) => self.postMessage(bestMove(event.data.grid,event.data.depth));

