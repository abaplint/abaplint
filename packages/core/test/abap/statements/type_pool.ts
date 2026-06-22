import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `TYPE-POOL abc.`,
];

statementType(tests, "TYPE-POOL", Statements.TypePool);

const versionsFail = [
  {abap: `TYPE-POOL abc.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TYPE-POOL");
