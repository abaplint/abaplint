import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET BLANK LINES ON.",
  "SET BLANK LINES OFF.",
];

statementType(tests, "SET BLANK", Statements.SetBlank);