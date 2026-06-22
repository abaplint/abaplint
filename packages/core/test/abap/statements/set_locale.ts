import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET LOCALE LANGUAGE lang COUNTRY cntry.",
  "SET LOCALE LANGUAGE lang.",
  "SET LOCALE LANGUAGE lv_lang COUNTRY lv_country MODIFIER lv_mod.",
];

statementType(tests, "SET LOCALE", Statements.SetLocale);

const versionsFail = [
  {abap: `SET LOCALE LANGUAGE lang COUNTRY cntry.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET LOCALE");
