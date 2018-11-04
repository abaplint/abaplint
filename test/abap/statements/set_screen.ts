import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SET SCREEN 0001.",
];

statementType(tests, "SET SCREEN", Statements.SetScreen);