import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `PROCESS AFTER INPUT.`,
];

statementType(tests, "PROCESS AFTER INPUT", Statements.ProcessAfterInput);

const versionsFail = [
  {abap: `PROCESS AFTER INPUT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PROCESS AFTER INPUT");
