import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET foobar.",
  "GET foobar LATE.",
  "GET foobar FIELDS field1 field2.",
  "GET foobar LATE FIELDS field.",
];

statementType(tests, "GET", Statements.Get);

const versionsFail = [
  {abap: `GET foobar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET");
