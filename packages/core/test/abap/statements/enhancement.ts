import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENHANCEMENT 1  foobar.",
  "ENHANCEMENT 3  /foo/bar.",
];

statementType(tests, "ENHANCEMENT", Statements.Enhancement);