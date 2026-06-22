import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "MODULE user_command_2000 INPUT.",
  "MODULE pbo_2000 OUTPUT.",
  "MODULE okcode.",
];

statementType(tests, "MODULE", Statements.Module);

const versionsFail = [
  {abap: `MODULE user_command_2000 INPUT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "MODULE");
