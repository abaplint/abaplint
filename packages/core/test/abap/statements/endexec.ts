import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENDEXEC.",
];

statementType(tests, "ENDEXEC", Statements.EndExec);