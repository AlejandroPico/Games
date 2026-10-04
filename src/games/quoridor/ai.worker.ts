import { automatic, type State } from "./rules";
self.onmessage = (e: MessageEvent<State>) =>
  self.postMessage(automatic(e.data));
