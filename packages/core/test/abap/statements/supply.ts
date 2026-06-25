import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SUPPLY foo = bar TO CONTEXT ctx.",
];

statementType(tests, "SUPPLY", Statements.Supply);

const versionsFail = [
  {abap: `SUPPLY foo = bar TO CONTEXT ctx.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SUPPLY");
