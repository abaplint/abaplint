import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "INITIALIZATION.",
];

statementType(tests, "INITIALIZATION", Statements.Initialization);

const versionsFail = [
  {abap: `INITIALIZATION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "INITIALIZATION");
