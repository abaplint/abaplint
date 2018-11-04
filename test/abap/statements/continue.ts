import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "continue.",
];

statementType(tests, "CONTINUE", Statements.Continue);