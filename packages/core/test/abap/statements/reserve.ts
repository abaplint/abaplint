import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "RESERVE 10 LINES.",
];

statementType(tests, "RESERVE", Statements.Reserve);

const versionsFail = [
  {abap: `RESERVE 10 LINES.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "RESERVE");
