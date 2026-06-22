import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `END-ENHANCEMENT-SECTION.`,
];

statementType(tests, "END-ENHANCEMENT-SECTION", Statements.EndEnhancementSection);

const versionsFail = [
  {abap: `END-ENHANCEMENT-SECTION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "END-ENHANCEMENT-SECTION");
