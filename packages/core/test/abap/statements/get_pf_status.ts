import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET PF-STATUS lv_stat.",
  "GET PF-STATUS vv_stat PROGRAM lv_prog EXCLUDING lt_fcode.",
  "GET PF-STATUS DATA(gui_status) PROGRAM gui_status_prog.",
];

statementType(tests, "GET PF-STATUS", Statements.GetPFStatus);

const versionsFail = [
  {abap: `GET PF-STATUS lv_stat.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET PF-STATUS");
