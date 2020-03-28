import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CLASS-DATA BEGIN OF blah READ-ONLY.",
];

statementType(tests, "CLASS DATA BEGIN", Statements.ClassDataBegin);