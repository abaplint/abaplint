import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
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
  "  NAME       l_name\n" +
  "  MESSAGE-ID l_id\n" +
  "  MESSAGE    l_message\n" +
  "  LINE       l_line\n" +
  "  OFFSET     l_offset\n" +
  "  WORD       l_word.",
];

statementType(tests, "GENERATE SUBROUTINE", Statements.GenerateSubroutine);