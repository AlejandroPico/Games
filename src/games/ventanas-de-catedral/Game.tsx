import AbstractTable from "../../shared/AbstractTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <AbstractTable
      id="ventanas-de-catedral"
      engine={engine}
      workerFactory={() =>
        new Worker(new URL("./ai.worker.ts", import.meta.url), {
          type: "module",
        })
      }
      choices={[2, 3, 4]}
    />
  );
}
