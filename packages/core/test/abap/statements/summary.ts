import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SUMMARY.",
];

statementType(tests, "SUMMARY", Statements.Summary);