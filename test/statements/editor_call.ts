import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EDITOR-CALL FOR lv_source DISPLAY-MODE TITLE lv_title.",
];

statementType(tests, "EDITOR-CALL", Statements.EditorCall);