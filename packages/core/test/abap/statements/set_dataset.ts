import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET DATASET l_file POSITION l_pos.",
  "SET DATASET i_filename POSITION END OF FILE.",
];

statementType(tests, "SET DATASET", Statements.SetDataset);