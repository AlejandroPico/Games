import { automatic, type State } from "./rules";
self.onmessage = (event: MessageEvent<State>) =>
  self.postMessage(automatic(event.data));
