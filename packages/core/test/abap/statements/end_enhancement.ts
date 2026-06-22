import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENDENHANCEMENT.",
];

statementType(tests, "ENDENHANCEMENT", Statements.EndEnhancement);

const versionsFail = [
  {abap: `ENDENHANCEMENT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "END-ENHANCEMENT");
