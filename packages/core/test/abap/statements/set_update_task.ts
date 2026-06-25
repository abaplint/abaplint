import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET UPDATE TASK LOCAL.",
];

statementType(tests, "SET UPDATE TASK", Statements.SetUpdateTask);

const versionsFail = [
  {abap: `SET UPDATE TASK LOCAL.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET UPDATE TASK LOCAL");
