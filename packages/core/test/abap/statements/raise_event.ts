import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "RAISE EVENT message.",
  "RAISE EVENT message EXPORTING p_kind    = c_error p_test    = c_my_name.",
];

statementType(tests, "RAISE EVENT", Statements.RaiseEvent);

const keyUserFail = [
  {abap: `RAISE EVENT my_event.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "RAISE EVENT KeyUser restrictions");