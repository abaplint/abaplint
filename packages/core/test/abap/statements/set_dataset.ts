import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET DATASET l_file POSITION l_pos.",
];

statementType(tests, "SET DATASET", Statements.SetDataset);