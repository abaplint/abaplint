import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "call badi lr_badi->method importing ev_foo = lv_moo ev_bar = lv_boo.",
];

statementType(tests, "CALL BADI", Statements.CallBadi);
