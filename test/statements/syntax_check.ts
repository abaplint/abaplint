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

  "SYNTAX-CHECK FOR\n" +
  "    DYNPRO     l_dynp-h\n" +
  "               l_dynp-f\n" +
  "               l_dynp-e\n" +
  "               l_dynp-m\n" +
  "    MESSAGE    lv_message\n" +
  "    LINE       lv_line\n" +
  "    WORD       lv_word\n" +
  "    OFFSET     lv_offset\n" +
  "    MESSAGE-ID lv_id.",

  "SYNTAX-CHECK FOR source_code\n" +
  "  MESSAGE lv_message\n" +
  "  LINE    lv_line\n" +
  "  OFFSET  lv_offset\n" +
  "  WORD    lv_word\n" +
  "  PROGRAM lv_progname\n" +
  "  REPLACING lv_replace\n" +
  "  DIRECTORY ENTRY lv_directory\n" +
  "  FRAME ENTRY lv_frame\n" +
  "  INCLUDE lv_include\n" +
  "  MESSAGE-ID lv_id\n" +
  "  ID main_id TABLE lt_main\n" +
  "  ID warn_id TABLE lt_warn\n" +
  "  ID desc_id TABLE lt_desc.",
];

statementType(tests, "SYNTAX-CHECK", Statements.SyntaxCheck);