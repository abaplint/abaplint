import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "add 2 to lv_foo.",
  "add 2 to\n lv_foo.",
  "add 2 to\r\n lv_foo.",
  "add zcl_class=>c_diagonal to lo_foo->mode.",
  "ADD sdf-dsf THEN sdf-dsf UNTIL sdf-dsf GIVING sdf-sdf.",
];

statementType(tests, "ADD", Statements.Add);