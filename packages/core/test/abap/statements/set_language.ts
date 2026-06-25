import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET LANGUAGE SY-LANGU.",
];

statementType(tests, "SET LANGUAGE", Statements.SetLanguage);

const versionsFail = [
  {abap: `SET LANGUAGE SY-LANGU.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET LANGUAGE");
