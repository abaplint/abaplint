import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "ROLLBACK WORK.",
  "ROLLBACK CONNECTION (lv_con).",
  "ROLLBACK CONNECTION default.",
];

statementType(tests, "ROLLBACK WORK", Statements.Rollback);

statementVersionFail([
  {abap: "ROLLBACK WORK.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "ROLLBACK not allowed in KeyUser");