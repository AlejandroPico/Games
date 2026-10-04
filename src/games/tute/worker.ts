import { automatic } from "./rules";
self.onmessage = (e) => self.postMessage(automatic(e.data));
