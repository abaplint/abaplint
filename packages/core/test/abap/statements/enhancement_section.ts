import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENHANCEMENT-SECTION section SPOTS spot.",
  "ENHANCEMENT-SECTION foo-bar SPOTS sdf.",
  "ENHANCEMENT-SECTION asdf SPOTS asdf INCLUDE BOUND.",
];

statementType(tests, "ENHANCEMENT-SECTION", Statements.EnhancementSection);

const versionsFail = [
  {abap: `ENHANCEMENT-SECTION section SPOTS spot.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENHANCEMENT-SECTION");
