import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "REFRESH bar.",
  "REFRESH tab-520.",
  "REFRESH tab-520m FROM TABLE t520m.",
];

statementType(tests, "REFRESH", Statements.Refresh);