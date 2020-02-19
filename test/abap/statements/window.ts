import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "WINDOW STARTING AT 1 1 ENDING AT 2 2.",
  "window starting at 1 1.",
];

statementType(tests, "WINDOW", Statements.Window);