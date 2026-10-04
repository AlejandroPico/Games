import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return <DeductionTable id="codigo-de-redes" engine={engine} choices={[4]} />;
}
