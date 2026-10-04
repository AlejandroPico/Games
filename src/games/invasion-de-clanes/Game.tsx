import StrategyTable from "../../shared/StrategyTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <StrategyTable
      id="invasion-de-clanes"
      engine={engine}
      choices={[2, 3, 4]}
      privateTable={false}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
