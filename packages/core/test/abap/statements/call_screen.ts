import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CALL SCREEN 0011.",
  "CALL SCREEN 3000 STARTING AT 10 2.",
  "CALL SCREEN '0900' STARTING AT 25 5 ENDING AT gv_end_spalte gv_end_zeile.",
];

statementType(tests, "CALL SCREEN", Statements.CallScreen);

const versionsFail = [
  {abap: `CALL SCREEN 0011.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL SCREEN");
