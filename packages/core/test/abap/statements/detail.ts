import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DETAIL.",
];

statementType(tests, "DETAIL", Statements.Detail);

const versionsFail = [
  {abap: `DETAIL.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DETAIL");
