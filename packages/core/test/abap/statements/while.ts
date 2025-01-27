import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "WHILE strlen( rv_bits ) < iv_length.",
  "WHILE NOT lv_hex IS INITIAL.",
  "WHILE lv_int < 10 VARY lv_vary FROM field1 NEXT field2.",
  "WHILE <foo-bar> IS INITIAL.",

  `WHILE sy-index <= 10
      VARY foo FROM moo NEXT boo
      VARY bar FROM baa NEXT caa.`,
];

statementType(tests, "WHILE", Statements.While);