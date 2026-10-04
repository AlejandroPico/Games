import LogicTable from "../../shared/LogicTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <LogicTable
      id="puzle-de-tuberias"
      engine={engine}
      sizes={[4, 6, 8]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
