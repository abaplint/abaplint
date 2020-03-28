import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "PACK foo TO bar.",
];

statementType(tests, "PACK", Statements.Pack);