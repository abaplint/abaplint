import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DELETE REPORT zfoobar.",
  "DELETE REPORT ls_foo-name.",
  "delete report lv_report state 'I'.",
];

statementType(tests, "DELETE REPORT", Statements.DeleteReport);

const versionsFail = [
  {abap: `DELETE REPORT zfoobar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DELETE REPORT");
