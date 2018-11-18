import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "continue.",
];

statementType(tests, "CONTINUE", Statements.Continue);