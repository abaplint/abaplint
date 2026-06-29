import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET TITLEBAR 'TITLE'.",
  "SET TITLEBAR 'TITLE_2000' WITH text-t08.",
  "set titlebar 'T00' with field1 field2.",
  "SET TITLEBAR 'TITLE_3000' OF PROGRAM sy-cprog WITH text-001.",
];

statementType(tests, "SET TITLEBAR", Statements.SetTitlebar);

const versionsFail = [
  {abap: `SET TITLEBAR 'TITLE'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET TITLEBAR");
