import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "REJECT.",
  "REJECT 'BKPF'.",
];

statementType(tests, "REJECT", Statements.Reject);

const versionsFail = [
  {abap: `REJECT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "REJECT");
