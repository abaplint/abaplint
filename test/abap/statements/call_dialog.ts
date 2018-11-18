import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "call dialog 'ZDIALOG' exporting foo from bar.",
  "CALL DIALOG 'ZDIALOG' EXPORTING field stru-field tcode moo FROM boo.",

  "CALL DIALOG 'ZFOOBAR'\n" +
  "  EXPORTING\n" +
  "    i_foo FROM i_foo\n" +
  "  IMPORTING\n" +
  "    e_bar TO e_bar.",

  "call dialog 'DIALOG'\n" +
  "  exporting\n" +
  "    field1 from value\n" +
  "    field2 from 'FOO'.",

];

statementType(tests, "CALL DIALOG", Statements.CallDialog);