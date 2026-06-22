import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "PUT ldb.",
];

statementType(tests, "PUT", Statements.Put);

const versionsFail = [
  {abap: `PUT ldb.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PUT");
