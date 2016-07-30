import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "CALL SELECTION-SCREEN 1001.",
    ];

statementType(tests, "CALL SELECTION-SCREEN", Statements.CallSelectionScreen);