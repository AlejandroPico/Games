import LogicTable from "../../shared/LogicTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <LogicTable
      id="rutas-de-luces-lights-out"
      engine={engine}
      sizes={[3, 5, 7]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
