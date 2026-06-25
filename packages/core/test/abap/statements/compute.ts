import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "COMPUTE exact <foo> = bar.",
];

statementType(tests, "COMPUTE", Statements.Compute);

const versionsFail = [
  {abap: `COMPUTE exact <foo> = bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "COMPUTE");

const keyUserFail = [
  {abap: `COMPUTE lv = 1 + 2.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "COMPUTE KeyUser restrictions");
