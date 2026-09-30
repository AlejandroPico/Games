import { bestMove, bestContinuousMove, type ContinuousState } from "./rules";
self.onmessage = (
  e: MessageEvent<{ state: ContinuousState; continuous: boolean }>,
) =>
  self.postMessage(
    e.data.continuous
      ? bestContinuousMove(e.data.state)
      : bestMove(e.data.state.board),
  );
