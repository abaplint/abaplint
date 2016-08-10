import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT SELECTION-SCREEN.",
  "AT SELECTION-SCREEN OUTPUT.",
  "AT SELECTION-SCREEN ON EXIT-COMMAND.",
  "AT SELECTION-SCREEN ON p_trkorr.",
  "AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path.",
];

statementType(tests, "AT SELECTION-SCREEN", Statements.AtSelectionScreen);