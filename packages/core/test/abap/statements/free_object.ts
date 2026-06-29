import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "free object foobar.",
];

statementType(tests, "FREE OBJECT", Statements.FreeObject);

const versionsFail = [
  {abap: `free object foobar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "FREE OBJECT");
