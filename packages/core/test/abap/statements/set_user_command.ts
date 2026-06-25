import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "set user-command 'ASDF'.",
];

statementType(tests, "SET USER-COMMAND", Statements.SetUserCommand);

const versionsFail = [
  {abap: `set user-command 'ASDF'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET USER-COMMAND");
