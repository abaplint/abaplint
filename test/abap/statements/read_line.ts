import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "READ LINE lv_line LINE VALUE INTO lv_text.",
  "read line sy-index field value lv_val into lv_target.",
  "READ LINE sy-index FIELD VALUE mark.",
  "READ LINE sy-index.",
  "READ LINE 2 INDEX 0.",
  "read line ls_header-linno of page ls_header-pagno index sy-lsind field value <lv_val>.",
  "READ LINE lv_line OF CURRENT PAGE.",
  "READ CURRENT LINE FIELD VALUE foo bar.",
];

statementType(tests, "READ LINE", Statements.ReadLine);