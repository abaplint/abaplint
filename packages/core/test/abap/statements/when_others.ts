import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "WHEN OTHERS.",
];

statementType(tests, "WHEN OTHERS", Statements.WhenOthers);