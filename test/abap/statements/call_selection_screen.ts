import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CALL SELECTION-SCREEN 1001.",
  "CALL SELECTION-SCREEN DYNNR STARTING AT 5 5 ENDING AT 60 8.",
  "CALL SELECTION-SCREEN 200 STARTING AT 5 15.",
  "CALL SELECTION-SCREEN '1100' USING SELECTION-SET foo-variant.",
];

statementType(tests, "CALL SELECTION-SCREEN", Statements.CallSelectionScreen);