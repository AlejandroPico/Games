import CardTable from "../../shared/CardTable";
import { engine } from "./rules";
export default function Game() {
  return (
    <CardTable
      id="mau-mau"
      engine={engine}
      choices={[2, 3, 4]}
      workerFactory={() =>
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      }
    />
  );
}
