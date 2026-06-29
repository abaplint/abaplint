import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `VERIFICATION-MESSAGE point msg.`,
  `VERIFICATION-MESSAGE 'ABORT' 'error' PRIORITY 4.`,
];

statementType(tests, "VERFICATION-MESSAGE", Statements.VerificationMessage);

const versionsFail = [
  {abap: `VERIFICATION-MESSAGE point msg.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "VERIFICATION-MESSAGE");
