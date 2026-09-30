import { useEffect, useRef, useState } from "react";
export function useAI<T, R>(
  WorkerClass: new () => Worker,
  input: T,
  enabled: boolean,
  onMove: (result: R) => void,
) {
  const callback = useRef(onMove);
  callback.current = onMove;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) {
      setBusy(false);
      return;
    }
    const worker = new WorkerClass();
    setBusy(true);
    setError("");
    worker.onmessage = (e) => {
      setBusy(false);
      callback.current(e.data as R);
    };
    worker.onerror = () => {
      setBusy(false);
      setError(
        "No se ha podido calcular la jugada. Reinicia la partida para reintentar.",
      );
    };
    worker.postMessage(input);
    return () => worker.terminate();
  }, [enabled, input, WorkerClass]);
  return { busy, error };
}
