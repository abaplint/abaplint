import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GENERATE SUBROUTINE POOL lt_source\n" +
  "  NAME    l_name\n" +
  "  MESSAGE l_error\n" +
  "  LINE    l_line.",

  "GENERATE SUBROUTINE POOL lt_source\n" +
  "  NAME    l_name\n" +
  "  MESSAGE l_message\n" +
  "  LINE    l_line\n" +
  "  WORD    l_word\n" +
  "  OFFSET  l_offset.",

  "GENERATE SUBROUTINE POOL lt_source NAME l_name.",

  "GENERATE SUBROUTINE POOL lt_source\n" +
  "  NAME lv_name\n" +
  "  MESSAGE lv_message\n" +
  "  SHORTDUMP-ID lv_sort.",

  "GENERATE SUBROUTINE POOL lt_source\n" +
  "  NAME       l_name\n" +
  "  MESSAGE-ID l_id\n" +
  "  MESSAGE    l_message\n" +
  "  LINE       l_line\n" +
  "  OFFSET     l_offset\n" +
  "  WORD       l_word.",

  "GENERATE SUBROUTINE\n" +
  "  POOL         lt_source\n" +
  "  NAME         lv_name\n" +
  "  INCLUDE      lv_include\n" +
  "  LINE         lv_line\n" +
  "  OFFSET       lv_offset\n" +
  "  WORD         lv_word\n" +
  "  MESSAGE      lv_message\n" +
  "  MESSAGE-ID   lv_id\n" +
  "  SHORTDUMP-ID lv_short.",
];

statementType(tests, "GENERATE SUBROUTINE", Statements.GenerateSubroutine);