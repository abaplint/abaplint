import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "position lv_pos.",
];

statementType(tests, "POSITION", Statements.Position);

const versionsFail = [
  {abap: `position lv_pos.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "POSITION");
