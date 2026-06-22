import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `ENDCHAIN.`,
];

statementType(tests, "END-CHAIN", Statements.EndChain);

const versionsFail = [
  {abap: `ENDCHAIN.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "END-CHAIN");
