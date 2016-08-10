import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL SCREEN 0011.",
  "CALL SCREEN 3000 STARTING AT 10 2.",
];

statementType(tests, "CALL SCREEN", Statements.CallScreen);