import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SUMMARY.",
];

statementType(tests, "SUMMARY", Statements.Summary);