import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET RUN TIME FIELD lv_t1.",
];

statementType(tests, "GET RUN TIME", Statements.GetRunTime);

const versionsFail = [
  {abap: `GET RUN TIME FIELD lv_t1.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET RUN TIME");
