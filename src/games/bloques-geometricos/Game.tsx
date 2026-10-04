import AbstractTable from "../../shared/AbstractTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <AbstractTable
      id="bloques-geometricos"
      engine={engine}
      workerFactory={() =>
        new Worker(new URL("./ai.worker.ts", import.meta.url), {
          type: "module",
        })
      }
      sizes={[20, 14]}
      choices={[4, 2, 3]}
    />
  );
}
