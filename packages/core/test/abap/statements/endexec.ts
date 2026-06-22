import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENDEXEC.",
];

statementType(tests, "ENDEXEC", Statements.EndExec);

const versionsFail = [
  {abap: `ENDEXEC.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDEXEC");
