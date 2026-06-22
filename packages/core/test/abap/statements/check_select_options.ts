import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `CHECK SELECT-OPTIONS.`,
];

statementType(tests, "CHECK SELECT-OPTIONS", Statements.CheckSelectOptions);

const versionsOkAsCheck = [
  {abap: `CHECK SELECT-OPTIONS.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionOk(versionsOkAsCheck, "CHECK SELECT-OPTIONS falls back to Check under Cloud", Statements.Check);
