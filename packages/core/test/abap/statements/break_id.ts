import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "break-point id foo.",
];

statementType(tests, "BREAK-POINT ID", Statements.BreakId);

const versionsFail = [
  {abap: `break-point id foo.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "BREAK-POINT ID");
