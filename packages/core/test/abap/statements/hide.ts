import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "HIDE gv_field.",
  "HIDE foobar#.",
];

statementType(tests, "HIDE", Statements.Hide);

const versionsFail = [
  {abap: `HIDE gv_field.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "HIDE");
