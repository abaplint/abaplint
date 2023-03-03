import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "AT LAST.",
];

statementType(tests, "AT LAST", Statements.AtLast);