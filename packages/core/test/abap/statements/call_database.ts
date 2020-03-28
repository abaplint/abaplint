import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CALL DATABASE PROCEDURE ('ZFOO')\n" +
  "  EXPORTING foo = bar\n" +
  "  IMPORTING moo = boo.",

  "CALL DATABASE PROCEDURE (lv_name) CONNECTION (lv_con) PARAMETER-TABLE lt_par.",
];

statementType(tests, "CALL DATABASE", Statements.CallDatabase);