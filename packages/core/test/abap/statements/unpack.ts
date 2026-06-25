import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "UNPACK lv_dt TO lv_date.",
];

statementType(tests, "UNPACK", Statements.Unpack);

const versionsFail = [
  {abap: `UNPACK lv_dt TO lv_date.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "UNPACK");
