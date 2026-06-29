import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

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

  `CALL DIALOG gi_var-field
     EXPORTING psps.`,
];

statementType(tests, "CALL DIALOG", Statements.CallDialog);

const versionsFail = [
  {abap: `call dialog 'ZDIALOG' exporting foo from bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL DIALOG");
