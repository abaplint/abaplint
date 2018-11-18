import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "STATICS END OF foo.",
];

statementType(tests, "STATIC END", Statements.StaticEnd);