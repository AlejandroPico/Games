import DeductionTable from "../../shared/DeductionTable";
import * as engine from "./rules";
export default function Game() {
  return (
    <DeductionTable id="el-intruso" engine={engine} choices={[4, 3, 5, 6]} />
  );
}
