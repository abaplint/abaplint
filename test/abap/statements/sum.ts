import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SUM.",
];

statementType(tests, "SUM", Statements.Sum);