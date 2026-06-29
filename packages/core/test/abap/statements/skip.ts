import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SKIP.",
  "SKIP TO LINE 12.",
  "SKIP 1.",
];

statementType(tests, "SKIP", Statements.Skip);

const versionsFail = [
  {abap: `SKIP.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SKIP");
