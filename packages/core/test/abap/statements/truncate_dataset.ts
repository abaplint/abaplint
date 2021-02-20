import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "truncate dataset i_filename at current position.",
];

statementType(tests, "TRUNCATE DATASET", Statements.TruncateDataset);