import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "EXEC SQL.",
  "EXEC SQL PERFORMING name.",
];

statementType(tests, "EXEC SQL", Statements.ExecSQL);