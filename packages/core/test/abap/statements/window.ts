import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "WINDOW STARTING AT 1 1 ENDING AT 2 2.",
  "window starting at 1 1.",
];

statementType(tests, "WINDOW", Statements.Window);

const versionsFail = [
  {abap: `WINDOW STARTING AT 1 1 ENDING AT 2 2.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "WINDOW");
