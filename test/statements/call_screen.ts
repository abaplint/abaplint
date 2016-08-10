import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL SCREEN 0011.",
  "CALL SCREEN 3000 STARTING AT 10 2.",
  "CALL SCREEN '0900' STARTING AT 25 5 ENDING AT gv_end_spalte gv_end_zeile."
];

statementType(tests, "CALL SCREEN", Statements.CallScreen);