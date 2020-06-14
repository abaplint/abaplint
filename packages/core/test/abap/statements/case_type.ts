import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CASE TYPE OF typedescr.",
  "CASE TYPE OF me->something.",
];

statementType(tests, "CASE TYPE", Statements.CaseType);