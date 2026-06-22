import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `TABLES ztab.`,
];

statementType(tests, "TABLES", Statements.Tables);

const versionsFail = [
  {abap: `TABLES ztab.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TABLES");
