import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "WHILE strlen( rv_bits ) < iv_length.",
  "WHILE NOT lv_hex IS INITIAL.",
  "WHILE lv_int < 10 VARY lv_vary FROM field1 NEXT field2.",
];

statementType(tests, "WHILE", Statements.While);