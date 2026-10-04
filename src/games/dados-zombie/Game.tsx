import DiceTable from "../../shared/DiceTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DiceTable
      id="dados-zombie"
      engine={engine}
      targets={[13, 8, 20]}
      detail={(s) => (
        <p>
          {s.lastColors
            .map((c) => ["Verde", "Amarillo", "Rojo"][c])
            .join(" · ")}
        </p>
      )}
      targetLabel="Puntos objetivo"
    />
  );
}
