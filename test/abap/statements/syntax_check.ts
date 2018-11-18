import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
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

  "SYNTAX-CHECK FOR DYNPRO\n" +
  "  dynpro->header\n" +
  "  dynpro->fields\n" +
  "  dynpro->flow\n" +
  "  dynpro->params\n" +
  "  MESSAGE lv_msg\n" +
  "  MESSAGE-ID lv_id\n" +
  "  LINE lv_line\n" +
  "  WORD lv_word.",

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

  "SYNTAX-CHECK FOR lt_report MESSAGE mess LINE lin WORD wrd PROGRAM lv_gen_repid.",

  "SYNTAX-CHECK FOR code MESSAGE mess LINE lin WORD wrd ID 'MSG' TABLE warnings PROGRAM sy-repid.",

  "syntax-check for source message mess line lin program prog word word include incl.",

  "SYNTAX-CHECK FOR DYNPRO l_dynp-h\n" +
  "  l_dynp-f\n" +
  "  l_dynp-e\n" +
  "  l_dynp-m\n" +
  "  MESSAGE message\n" +
  "  LINE    line\n" +
  "  WORD    word.",

  "SYNTAX-CHECK FOR PROGRAM prog\n" +
  "  MESSAGE   message\n" +
  "  LINE      line\n" +
  "  WORD      word\n" +
  "  REPLACING replacing.",

  "syntax-check for l_source\n" +
  "  directory entry lv_entry\n" +
  "  include     lv_include\n" +
  "  message     lv_message\n" +
  "  message-id  lv_id\n" +
  "  line        lv_line\n" +
  "  word        lv_word\n" +
  "  offset      lv_offset\n" +
  "  trace-table lv_trace\n" +
  "  id          var1 table DUMMY_TAB\n" +
  "  id          var2 table DUMMY_TAB\n" +
  "  id          var3 table DUMMY_TAB.",

  "SYNTAX-CHECK FOR l_source\n" +
  "  MESSAGE        l_message\n" +
  "  LINE           l_line\n" +
  "  WORD           l_word\n" +
  "  PROGRAM        l_program\n" +
  "  INCLUDE        l_include\n" +
  "  MESSAGE-ID     l_message_id\n" +
  "  SHORTDUMP-ID   l_dump\n" +
  "  ID 'MSG' TABLE l_msg.",

];

statementType(tests, "SYNTAX-CHECK", Statements.SyntaxCheck);