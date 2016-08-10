import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PERFORM set_pf_status IN PROGRAM rsdbrunt IF FOUND.",
  "PERFORM create_variant USING <ls_classdf>-clsname.",
  "PERFORM upfile CHANGING p_upfile.",
  "PERFORM (lv_form) IN PROGRAM.",
  "PERFORM sub TABLES bar USING foo.",
  "PERFORM run.",
];

statementType(tests, "PERFORM", Statements.Perform);