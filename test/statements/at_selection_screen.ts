import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT SELECTION-SCREEN.",
  "AT SELECTION-SCREEN OUTPUT.",
  "AT SELECTION-SCREEN ON EXIT-COMMAND.",
  "AT SELECTION-SCREEN ON VALUE-REQUEST FOR so_foo-low.",
  "at selection-screen on radiobutton group grp1.",
  "AT SELECTION-SCREEN ON p_trkorr.",
  "AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path.",
  "AT SELECTION-SCREEN ON BLOCK part1.",
];

statementType(tests, "AT SELECTION-SCREEN", Statements.AtSelectionScreen);