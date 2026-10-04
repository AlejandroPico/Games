import LogicTable from "../../shared/LogicTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <LogicTable
      id="nonogramas-picross"
      engine={engine}
      sizes={[5, 8, 10]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
