import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "CLASS lcl_gui DEFINITION DEFERRED.",
  "CLASS zcl_foo DEFINITION DEFERRED PUBLIC.",
  "CLASS LCL_/foo/bar DEFINITION DEFERRED.",
];

statementType(tests, "CLASS other", Statements.ClassDeferred);

statementVersionFail([
  {abap: "CLASS lcl_foo DEFINITION DEFERRED.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "CLASS DEFERRED not allowed in KeyUser");