import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "REFRESH bar.",
  "REFRESH tab-520.",
  "REFRESH tab-520m FROM TABLE t520m.",
];

statementType(tests, "REFRESH", Statements.Refresh);

const versionsFail = [
  {abap: `REFRESH bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "REFRESH");
