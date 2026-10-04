import CardTable from "../../shared/CardTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <CardTable
      id="cribbage"
      engine={engine}
      choices={[2]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
