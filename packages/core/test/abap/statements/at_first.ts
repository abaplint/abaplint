import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "AT FIRST.",
];

statementType(tests, "AT FIRST", Statements.AtFirst);