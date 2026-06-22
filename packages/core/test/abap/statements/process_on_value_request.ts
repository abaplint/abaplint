import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `PROCESS ON VALUE-REQUEST.`,
];

statementType(tests, "PROCESS ON VALUE-REQUEST", Statements.ProcessOnValueRequest);

const versionsFail = [
  {abap: `PROCESS ON VALUE-REQUEST.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PROCESS ON VALUE-REQUEST");
