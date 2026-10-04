import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DeductionTable
      id="linea-de-tiempo"
      engine={engine}
      choices={[2, 3, 4, 5, 6]}
    />
  );
}
