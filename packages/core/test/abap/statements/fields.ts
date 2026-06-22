import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "FIELDS TEXT-000.",
];

statementType(tests, "FIELDS", Statements.Fields);

const versionsFail = [
  {abap: `FIELDS TEXT-000.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "FIELDS");
