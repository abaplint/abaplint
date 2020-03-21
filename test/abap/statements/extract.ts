import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "EXTRACT header.",
  "EXTRACT.",
];

statementType(tests, "EXTRACT", Statements.Extract);