import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "RESERVE 10 LINES.",
];

statementType(tests, "RESERVE", Statements.Reserve);