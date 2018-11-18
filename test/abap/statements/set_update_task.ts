import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SET UPDATE TASK LOCAL.",
];

statementType(tests, "SET UPDATE TASK", Statements.SetUpdateTask);