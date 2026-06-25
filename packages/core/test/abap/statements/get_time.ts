import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "GET TIME STAMP FIELD lv_timestamp.",
  "GET TIME.",
  "GET TIME FIELD lv_time.",
];

statementType(tests, "GET TIME", Statements.GetTime);

const keyUserFail = [
  {abap: `GET TIME.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  {abap: `GET TIME STAMP FIELD lv_ts.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "GET TIME KeyUser restrictions");
