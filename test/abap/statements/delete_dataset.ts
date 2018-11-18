import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DELETE DATASET l_psepath.",
];

statementType(tests, "DELETE DATASET", Statements.DeleteDataset);