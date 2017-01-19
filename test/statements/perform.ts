import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PERFORM set_pf_status IN PROGRAM rsdbrunt IF FOUND.",
  "PERFORM create_variant USING <ls_classdf>-clsname.",
  "PERFORM upfile CHANGING p_upfile.",
  "PERFORM run(zprogram) USING foo bar moo.",
  "PERFORM (lv_form) IN PROGRAM.",
  "perform (lv_form) in program (lv_prog) changing lv_foo if found.",
  "PERFORM sub TABLES bar USING foo.",
  "PERFORM run.",
  "PERFORM run(zfoobar).",
  "PERFORM send ON COMMIT.",
  "perform moo in program zbar if found using foo changing bar.",
  "PERFORM moo ON COMMIT LEVEL lv_level.",
  "PERFORM moo ON ROLLBACK.",
  "PERFORM read_*table(zfoo) USING code.",
];

statementType(tests, "PERFORM", Statements.Perform);