import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CALL DATABASE PROCEDURE ('ZFOO')\n" +
  "  EXPORTING foo = bar\n" +
  "  IMPORTING moo = boo.",

  "CALL DATABASE PROCEDURE (lv_name) CONNECTION (lv_con) PARAMETER-TABLE lt_par.",
];

statementType(tests, "CALL DATABASE", Statements.CallDatabase);

const versionsFail = [
  {abap: `CALL DATABASE PROCEDURE ('ZFOO') EXPORTING foo = bar IMPORTING moo = boo.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL DATABASE");
