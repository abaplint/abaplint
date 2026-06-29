import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET SCREEN 0001.",
];

statementType(tests, "SET SCREEN", Statements.SetScreen);

const versionsFail = [
  {abap: `SET SCREEN 0001.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET SCREEN");
