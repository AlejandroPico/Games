import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable id="crown-and-anchor" engine={engine} targets={[10, 5, 20]} />
  );
}
