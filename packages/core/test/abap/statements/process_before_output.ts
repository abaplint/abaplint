import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `PROCESS BEFORE OUTPUT.`,
];

statementType(tests, "PROCESS BEFORE OUTPUT", Statements.ProcessBeforeOutput);

const versionsFail = [
  {abap: `PROCESS BEFORE OUTPUT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PROCESS BEFORE OUTPUT");
