import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET SCREEN 0001.",
];

statementType(tests, "SET SCREEN", Statements.SetScreen);