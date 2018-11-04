import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SUBTRACT foo FROM bar.",
];

statementType(tests, "SUBTRACT", Statements.Subtract);