import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "EXTRACT header.",
  "EXTRACT.",
];

statementType(tests, "EXTRACT", Statements.Extract);

const versionsFail = [
  {abap: `EXTRACT header.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "EXTRACT");
