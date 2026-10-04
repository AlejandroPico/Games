import LogicTable from "../../shared/LogicTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <LogicTable
      id="puentes-fluviales-hashiwokakero"
      engine={engine}
      sizes={[3, 5]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
