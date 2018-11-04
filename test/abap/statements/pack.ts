import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "PACK foo TO bar.",
];

statementType(tests, "PACK", Statements.Pack);