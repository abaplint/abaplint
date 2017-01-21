import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EDITOR-CALL FOR lv_source DISPLAY-MODE TITLE lv_title.",
  "EDITOR-CALL FOR REPORT 'ZFOO'.",
  "EDITOR-CALL FOR lt_text TITLE lv_title DISPLAY-MODE.",
];

statementType(tests, "EDITOR-CALL", Statements.EditorCall);