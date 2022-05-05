import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TEST-SEAM foo.",
  "TEST-SEAM foo-bar.",
];

statementType(tests, "TEST-SEAM", Statements.TestSeam);