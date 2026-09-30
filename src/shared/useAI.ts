import { useEffect, useRef, useState } from "react";
import { useObservation } from "./Observation";
export function useAI<T, R>(
  WorkerClass: new () => Worker,
  input: T,
  enabled: boolean,
  onMove: (result: R) => void,
) {
  const { watching, paused, delay } = useObservation();
  const active = enabled && (!watching || !paused);
  const callback = useRef(onMove);
  callback.current = onMove;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!active) {
      setBusy(false);
      return;
    }
    const worker = new WorkerClass();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    setBusy(true);
    setError("");
    worker.onmessage = (e) => {
      timer = setTimeout(
        () => {
          setBusy(false);
          callback.current(e.data as R);
        },
        watching ? Math.max(0, delay - (performance.now() - start)) : 0,
      );
    };
    worker.onerror = () => {
      setBusy(false);
      setError(
        "No se ha podido calcular la jugada. Reinicia la partida para reintentar.",
      );
    };
    worker.postMessage(input);
    return () => {
      clearTimeout(timer);
      worker.terminate();
    };
  }, [active, input, WorkerClass, watching, delay]);
  return { busy, error };
}
