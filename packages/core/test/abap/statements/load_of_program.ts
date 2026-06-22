import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "LOAD-OF-PROGRAM.",
];

statementType(tests, "LOAD-OF-PROGRAM", Statements.LoadOfProgram);

const versionsFail = [
  {abap: `LOAD-OF-PROGRAM.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "LOAD-OF-PROGRAM");
