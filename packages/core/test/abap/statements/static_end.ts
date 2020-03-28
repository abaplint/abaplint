import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "STATICS END OF foo.",
];

statementType(tests, "STATIC END", Statements.StaticEnd);