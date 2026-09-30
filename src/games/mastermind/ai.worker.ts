import { suggestion } from "./rules";
self.onmessage = (e) =>
  self.postMessage(suggestion(e.data.history, e.data.repeats));
