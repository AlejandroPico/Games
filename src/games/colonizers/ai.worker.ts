import { aiAction } from "./rules";
self.onmessage = (e) => self.postMessage(aiAction(e.data));
