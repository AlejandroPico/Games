import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="sichuan-dice"
      engine={engine}
      targets={[3, 1, 5]}
      detail={(s) => <p>Números abiertos: {s.tiles[s.turn].join(" · ")}</p>}
    />
  );
}
