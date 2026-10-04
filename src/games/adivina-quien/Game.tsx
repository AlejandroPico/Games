import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return <DeductionTable id="adivina-quien" engine={engine} choices={[2]} />;
}
