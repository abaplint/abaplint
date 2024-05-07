import {statementExpectFail, statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "EDITOR-CALL FOR lv_source DISPLAY-MODE TITLE lv_title.",
  "EDITOR-CALL FOR REPORT 'ZFOO'.",
  "EDITOR-CALL FOR lt_text TITLE lv_title DISPLAY-MODE.",
];
statementType(tests, "EDITOR-CALL", Statements.EditorCall);

const fails = [
  `EDITOR-CALL FOR lt_tab TITLE |Display| DISPLAY-MODE.`,
];
statementExpectFail(fails, "EDITOR-CALL");