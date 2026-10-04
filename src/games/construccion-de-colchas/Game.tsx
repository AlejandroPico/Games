import AbstractTable from "../../shared/AbstractTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <AbstractTable
      id="construccion-de-colchas"
      engine={engine}
      workerFactory={() =>
        new Worker(new URL("./ai.worker.ts", import.meta.url), {
          type: "module",
        })
      }
      sizes={[9, 6]}
    />
  );
}
