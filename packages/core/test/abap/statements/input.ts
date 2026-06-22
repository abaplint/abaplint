import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `INPUT.`,
];

statementType(tests, "INPUT", Statements.Input);

const versionsFail = [
  {abap: `INPUT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "INPUT");
