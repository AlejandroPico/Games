import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="dados-mentirosos-perudo"
      engine={engine}
      choices={[2, 3, 4, 5, 6]}
      targets={[5]}
      privateDice={(s) => s.phase !== "reveal"}
    />
  );
}
