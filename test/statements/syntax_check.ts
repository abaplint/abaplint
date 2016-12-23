import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SYNTAX-CHECK FOR lt_itab MESSAGE lv_mess LINE lv_lin WORD lv_wrd DIRECTORY ENTRY ls_trdir.",

  "SYNTAX-CHECK FOR lt_include\n" +
  "  MESSAGE lv_message\n" +
  "  LINE    lv_line\n" +
  "  OFFSET  lv_offset\n" +
  "  WORD    lv_word\n" +
  "  PROGRAM lv_program\n" +
  "  DIRECTORY ENTRY lv_entry\n" +
  "  FRAME ENTRY lv_frame\n" +
  "  INCLUDE lv_include\n" +
  "  MESSAGE-ID lv_message\n" +
  "  ID warn_id TABLE lt_warnings\n" +
  "  ID desc_id TABLE lt_error.",
];

statementType(tests, "SYNTAX-CHECK", Statements.SyntaxCheck);