import StrategyTable from "../../shared/StrategyTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <StrategyTable
      id="comercio-de-alubias"
      engine={engine}
      choices={[2, 3, 4]}
      privateTable
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
