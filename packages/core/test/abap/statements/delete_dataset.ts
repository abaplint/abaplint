import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DELETE DATASET l_psepath.",
];

statementType(tests, "DELETE DATASET", Statements.DeleteDataset);