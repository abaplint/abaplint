import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "LOCAL foo.",
  "LOCAL moo[].",
  "LOCAL foo-bar.",
];

statementType(tests, "LOCAL", Statements.Local);

const versionsFail = [
  {abap: `LOCAL foo.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "LOCAL");
