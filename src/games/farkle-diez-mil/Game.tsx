import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="farkle-diez-mil"
      engine={engine}
      targets={[10000, 5000, 2000]}
      targetLabel="Puntos objetivo"
    />
  );
}
