import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET UPDATE TASK LOCAL.",
];

statementType(tests, "SET UPDATE TASK", Statements.SetUpdateTask);