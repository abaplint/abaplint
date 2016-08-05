import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL SCREEN 0011.",
];

statementType(tests, "CALL SCREEN", Statements.CallScreen);