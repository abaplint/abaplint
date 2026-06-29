import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CREATE OBJECT cv_ole_app lv_ole_app.",
];

statementType(tests, "CREATE OBJECT", Statements.CreateOLE);

const versionsFail = [
  {abap: `CREATE OBJECT cv_ole_app lv_ole_app.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CREATE OBJECT OF");
