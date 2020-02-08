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
    message    lv_message
    message-id lv_msgid
    line       lv_line
    word       lv_word
    include    lv_include
    shortdump-id lv_dump
    directory entry lv_directory.`,

  `generate report lv_report
    with precompiled headers
    include     lv_include
    message     lv_message
    line        lv_line
    offset      lv_offset
    word        lv_word
    trace-file  lv_trace
    directory entry lv_trdir.`,
];

statementType(tests, "GENERATE REPORT", Statements.GenerateReport);