import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="pig-el-cerdo"
      engine={engine}
      targets={[100, 50, 200]}
      targetLabel="Puntos objetivo"
    />
  );
}
