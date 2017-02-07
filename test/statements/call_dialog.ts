import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "call dialog 'ZDIALOG' exporting foo from bar.",
  "CALL DIALOG 'ZDIALOG' EXPORTING field stru-field tcode moo FROM boo.",

  "CALL DIALOG 'ZFOOBAR'\n" +
  "  EXPORTING\n" +
  "    i_foo FROM i_foo\n" +
  "  IMPORTING\n" +
  "    e_bar TO e_bar.",
];

statementType(tests, "CALL DIALOG", Statements.CallDialog);