import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ROLLBACK WORK.",
  "ROLLBACK CONNECTION (lv_con).",
  "ROLLBACK CONNECTION default.",
];

statementType(tests, "ROLLBACK WORK", Statements.Rollback);