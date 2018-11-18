import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SUM.",
];

statementType(tests, "SUM", Statements.Sum);