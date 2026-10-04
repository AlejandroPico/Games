import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DeductionTable
      id="deduccion-alquimica"
      engine={engine}
      workerFactory={() =>
        new Worker(new URL("./ai.worker.ts", import.meta.url), {
          type: "module",
        })
      }
      choices={[2, 3, 4]}
      privateTable={false}
    />
  );
}
