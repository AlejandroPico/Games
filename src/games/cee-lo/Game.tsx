import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return <DiceTable id="cee-lo" engine={engine} targets={[6, 3, 12]} />;
}
