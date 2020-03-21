import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "COMPUTE exact <foo> = bar.",
];

statementType(tests, "COMPUTE", Statements.Compute);