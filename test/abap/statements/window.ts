import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "WINDOW STARTING AT 1 1 ENDING AT 2 2.",
];

statementType(tests, "WINDOW", Statements.Window);