import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET LEFT SCROLL-BOUNDARY.",
  "SET LEFT SCROLL-BOUNDARY COLUMN 002.",
];

statementType(tests, "SET LEFT", Statements.SetLeft);

const versionsFail = [
  {abap: `SET LEFT SCROLL-BOUNDARY.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET LEFT SCROLL-BOUNDARY");
