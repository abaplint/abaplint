import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "MODIFY SCREEN.",
  "MODIFY SCREEN FROM wa.",
];

statementType(tests, "MODIFY SCREEN", Statements.ModifyScreen);

const versionsOkAsModifyInternal = [
  {abap: `MODIFY SCREEN.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionOk(versionsOkAsModifyInternal, "MODIFY SCREEN falls back to ModifyInternal under Cloud", Statements.ModifyInternal);
