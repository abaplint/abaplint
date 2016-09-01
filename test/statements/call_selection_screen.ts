import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL SELECTION-SCREEN 1001.",
  "CALL SELECTION-SCREEN DYNNR STARTING AT 5 5 ENDING AT 60 8.",
];

statementType(tests, "CALL SELECTION-SCREEN", Statements.CallSelectionScreen);