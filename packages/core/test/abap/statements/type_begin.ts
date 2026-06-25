import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "TYPES BEGIN OF gty_icon.",
  "TYPES BEGIN OF /foo/bar.",
];

statementType(tests, "TYPE BEGIN", Statements.TypeBegin);

const versionsFail = [
  {abap: `TYPES BEGIN OF gty_icon %_FINAL.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TYPE BEGIN");
