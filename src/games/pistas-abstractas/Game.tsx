import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DeductionTable
      id="pistas-abstractas"
      engine={engine}
      choices={[3, 4, 5, 6]}
    />
  );
}
