import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SUPPRESS DIALOG.",
];

statementType(tests, "SUPPRESS DIALOG", Statements.SuppressDialog);