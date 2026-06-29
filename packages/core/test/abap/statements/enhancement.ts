import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENHANCEMENT 1  foobar.",
  "ENHANCEMENT 3  /foo/bar.",
];

statementType(tests, "ENHANCEMENT", Statements.Enhancement);

const versionsFail = [
  {abap: `ENHANCEMENT 1  foobar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENHANCEMENT");
