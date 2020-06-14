import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CASE TYPE OF typedescr.",
];

statementType(tests, "CASE TYPE", Statements.CaseType);