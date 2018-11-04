import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "ENDEXEC.",
];

statementType(tests, "ENDEXEC", Statements.EndExec);