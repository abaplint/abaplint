import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "REFRESH CONTROL 'TC' FROM SCREEN lv_dyn.",
];

statementType(tests, "REFRESH CONTROL", Statements.RefreshControl);

const versionsFail = [
  {abap: `REFRESH CONTROL 'TC' FROM SCREEN lv_dyn.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "REFRESH CONTROL");
