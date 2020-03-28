import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GET TIME STAMP FIELD lv_timestamp.",
  "GET TIME.",
  "GET TIME FIELD lv_time.",
];

statementType(tests, "GET TIME", Statements.GetTime);