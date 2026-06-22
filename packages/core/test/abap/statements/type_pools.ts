import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "TYPE-POOLS abap.",
];

statementType(tests, "TYPE-POOLS", Statements.TypePools);

const versionsFail = [
  {abap: `TYPE-POOLS abap.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TYPE-POOLS");
