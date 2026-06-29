import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `PROCESS ON HELP-REQUEST.`,
];

statementType(tests, "PROCESS ON HELP-REQUEST", Statements.ProcessOnHelpRequest);

const versionsFail = [
  {abap: `PROCESS ON HELP-REQUEST.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PROCESS ON HELP-REQUEST");
