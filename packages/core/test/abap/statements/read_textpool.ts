import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "READ TEXTPOOL lv_cp INTO lt_tpool LANGUAGE mv_language.",
  "READ TEXTPOOL lv_cp INTO lt_tpool.",
  "read textpool lv_cp language mv_lang into lt_tpool state 'A'.",
];
statementType(tests, "READ TEXTPOOL", Statements.ReadTextpool);

const versionsFail = [
  {abap: `READ TEXTPOOL lv_cp INTO lt_tpool LANGUAGE mv_language.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "READ TEXTPOOL");
