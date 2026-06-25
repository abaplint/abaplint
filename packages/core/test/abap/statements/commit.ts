import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "COMMIT WORK.",
  "COMMIT WORK AND WAIT.",
  "commit connection (lv_name).",
  "commit connection lv_con.",
];

statementType(tests, "COMMIT", Statements.Commit);

statementVersionFail([
  {abap: "COMMIT WORK.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "COMMIT not allowed in KeyUser");