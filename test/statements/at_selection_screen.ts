import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "AT SELECTION-SCREEN.",
  "AT SELECTION-SCREEN OUTPUT.",
  "AT SELECTION-SCREEN ON EXIT-COMMAND.",
  "AT SELECTION-SCREEN ON VALUE-REQUEST FOR so_foo-low.",
  "at selection-screen on radiobutton group grp1.",
  "AT SELECTION-SCREEN ON p_trkorr.",
  "AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path.",
  "AT SELECTION-SCREEN ON BLOCK part1.",
  "AT SELECTION-SCREEN ON HELP-REQUEST FOR field.",
  "AT SELECTION-SCREEN ON HELP-REQUEST FOR foo-low.",
  "AT SELECTION-SCREEN ON END OF foo.",
  "AT SELECTION-SCREEN ON foo-bar.",
  "AT SELECTION-SCREEN ON BLOCK 1.",
];

statementType(tests, "AT SELECTION-SCREEN", Statements.AtSelectionScreen);