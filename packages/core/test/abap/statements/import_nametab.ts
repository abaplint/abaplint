import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "IMPORT NAMETAB ls_data lt_data ID lv_name.",
];

statementType(tests, "IMPORT NAMETAB", Statements.ImportNametab);

const versionsFail = [
  {abap: `IMPORT NAMETAB ls_data lt_data ID lv_name.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "IMPORT NAMETAB");
