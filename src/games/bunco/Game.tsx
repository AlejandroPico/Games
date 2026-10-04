import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return <DiceTable id="bunco" engine={engine} targets={[6]} choices={[4]} />;
}
