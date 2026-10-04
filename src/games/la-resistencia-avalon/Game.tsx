import StrategyTable from "../../shared/StrategyTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <StrategyTable
      id="la-resistencia-avalon"
      engine={engine}
      choices={[5, 6]}
      privateTable
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
