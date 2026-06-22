import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SUMMARY.",
];

statementType(tests, "SUMMARY", Statements.Summary);

const versionsFail = [
  {abap: `SUMMARY.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SUMMARY");
