import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET MARGIN 1 5.",
  "SET MARGIN 00.",
  "SET MARGIN 10.",
];

statementType(tests, "SET MARGIN", Statements.SetMargin);

const versionsFail = [
  {abap: `SET MARGIN 1 5.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET MARGIN");
