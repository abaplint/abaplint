import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "catch system-exceptions import_mismatch_errors = 1.",
  "CATCH SYSTEM-EXCEPTIONS conversion_errors = zcl_foobar=>const.",
];

statementType(tests, "CATCH SYSTEM-EXCEPTIONS", Statements.CatchSystemExceptions);

const versionsFail = [
  {abap: `catch system-exceptions import_mismatch_errors = 1.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CATCH SYSTEM-EXCEPTIONS");
