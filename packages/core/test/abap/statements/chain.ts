import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `CHAIN.`,
];

statementType(tests, "CHAIN", Statements.Chain);

const versionsFail = [
  {abap: `CHAIN.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CHAIN");
