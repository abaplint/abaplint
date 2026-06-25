import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "AT USER-COMMAND.",
];

statementType(tests, "AT USER-COMMAND", Statements.AtUserCommand);

const versionsFail = [
  {abap: `AT USER-COMMAND.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "AT USER-COMMAND");
