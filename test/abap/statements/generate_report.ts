import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "generate report lv_name.",

  "generate report lv_name\n" +
  "  without selection-screen\n" +
  "  message lv_message\n" +
  "  include lv_include\n" +
  "  line lv_line\n" +
  "  word lv_word.",

  "GENERATE REPORT lv_name\n" +
  "  MESSAGE lv_message\n" +
  "  INCLUDE lv_include\n" +
  "  LINE    lv_line\n" +
  "  WORD    lv_word\n" +
  "  OFFSET  lv_offset.",

  "GENERATE REPORT l_name WITH PRECOMPILED HEADERS.",

  "GENERATE REPORT l_name WITH PRECOMPILED HEADERS WITH TEST CODE.",

  `generate report lv_report
    message lv_message
    include lv_include
    line lv_line
    message-id ls_message
    shortdump-id lv_shortdump.`,

  `generate report lv_report
    message    lv_MESSAGE
    message-id lv_MSGID
    line       lv_LINE
    word       lv_WORD
    include    lv_INCLUDE
    shortdump-id lv_dump
    directory entry lv_directory.`,

];

statementType(tests, "GENERATE REPORT", Statements.GenerateReport);