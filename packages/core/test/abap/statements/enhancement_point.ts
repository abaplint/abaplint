import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENHANCEMENT-POINT point SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot STATIC.",
  "ENHANCEMENT-POINT foo-bar SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot INCLUDE BOUND.",
];

statementType(tests, "ENHANCEMENT-POINT", Statements.EnhancementPoint);

const versionsFail = [
  {abap: `ENHANCEMENT-POINT point SPOTS spot.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENHANCEMENT-POINT");
