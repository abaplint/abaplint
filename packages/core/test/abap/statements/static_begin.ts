import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "STATICS BEGIN OF foo.",
  "STATICS BEGIN OF foo OCCURS 0.",
];

statementType(tests, "STATIC BEGIN", Statements.StaticBegin);