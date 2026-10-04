import StrategyTable from "../../shared/StrategyTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <StrategyTable
      id="mineros-saboteadores"
      engine={engine}
      choices={[3, 4, 5, 6]}
      privateTable
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
