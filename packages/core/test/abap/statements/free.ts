import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "free foobar.",
];

statementType(tests, "FREE", Statements.Free);

const keyUserFail = [
  {abap: `FREE lv.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "FREE KeyUser restrictions");