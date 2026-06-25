import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "EXEC SQL.",
  "EXEC SQL PERFORMING name.",
];

statementType(tests, "EXEC SQL", Statements.ExecSQL);

const versionsFail = [
  {abap: `EXEC SQL.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "EXEC SQL");
