import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "UNASSIGN <blah>.",
  "UNASSIGN <%%foo>.",
];

statementType(tests, "UNASSIGN", Statements.Unassign);