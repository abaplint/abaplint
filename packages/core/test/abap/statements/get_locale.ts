import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET LOCALE LANGUAGE lang COUNTRY cntry MODIFIER mod.",
];

statementType(tests, "GET LOCALE", Statements.GetLocale);

const versionsFail = [
  {abap: `GET LOCALE LANGUAGE lang COUNTRY cntry MODIFIER mod.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET LOCALE");
