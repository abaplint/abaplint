import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "break-point.",
  "BREAK-POINT AT NEXT APPLICATION STATEMENT.",
  "break username.",
  "BREAK sy-uname.",
  "BREAK sy-anything.",
  "BREAK-POINT lv_logtxt.",
  "BREAK foo-gül.",
  "BREAK 9sla.",
];

statementType(tests, "BREAK-POINT", Statements.Break);

const versionsFail = [
  {abap: `break-point.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "BREAK-POINT");
