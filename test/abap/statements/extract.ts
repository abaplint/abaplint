import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "EXTRACT header.",
  "EXTRACT.",
];

statementType(tests, "EXTRACT", Statements.Extract);