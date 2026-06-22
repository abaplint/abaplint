import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `CALL SUBSCREEN foo.`,
];

statementType(tests, "CALL SUBSCREEN", Statements.CallSubscreen);

const versionsFail = [
  {abap: `CALL SUBSCREEN foo.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL SUBSCREEN");
