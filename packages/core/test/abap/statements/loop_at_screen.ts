import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "LOOP AT SCREEN.",
  "LOOP AT SCREEN INTO DATA(line).",
];

statementType(tests, "LOOP AT SCREEN", Statements.LoopAtScreen);

const versionsFail = [
  {abap: "LOOP AT SCREEN.", rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "LOOP AT SCREEN");