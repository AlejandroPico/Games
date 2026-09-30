import { next } from "./autoplay";
self.onmessage = (e) => self.postMessage(next(e.data.state, e.data.visited));
