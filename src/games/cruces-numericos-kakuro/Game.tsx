import LogicTable from "../../shared/LogicTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <LogicTable
      id="cruces-numericos-kakuro"
      engine={engine}
      sizes={[7, 10]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
