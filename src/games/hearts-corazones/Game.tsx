import CardTable from "../../shared/CardTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <CardTable
      id="hearts-corazones"
      engine={engine}
      choices={[4]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
