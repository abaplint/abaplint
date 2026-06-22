import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "LOAD REPORT lv_prog PART 'HEAD' INTO lt_head.",
];

statementType(tests, "LOAD REPORT", Statements.LoadReport);

const versionsFail = [
  {abap: `LOAD REPORT lv_prog PART 'HEAD' INTO lt_head.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "LOAD REPORT");
