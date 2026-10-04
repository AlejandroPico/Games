import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="craps-dados-de-casino"
      engine={engine}
      targets={[10, 5, 20]}
    />
  );
}
