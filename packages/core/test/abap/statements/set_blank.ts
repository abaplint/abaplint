import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET BLANK LINES ON.",
  "SET BLANK LINES OFF.",
];

statementType(tests, "SET BLANK", Statements.SetBlank);

const versionsFail = [
  {abap: `SET BLANK LINES ON.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET BLANK LINES");
