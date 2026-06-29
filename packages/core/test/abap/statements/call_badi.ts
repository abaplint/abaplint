import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "call badi lr_badi->method importing ev_foo = lv_moo ev_bar = lv_boo.",
];

statementType(tests, "CALL BADI", Statements.CallBadi);

const versionsFail = [
  {abap: `call badi lr_badi->method importing ev_foo = lv_moo ev_bar = lv_boo.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `call badi lr_badi->method importing ev_foo = lv_moo ev_bar = lv_boo.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(versionsFail, "CALL BADI");
