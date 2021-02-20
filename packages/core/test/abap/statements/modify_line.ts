import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "MODIFY LINE sy-index FIELD VALUE lv_val FROM gc_false.",
  "MODIFY CURRENT LINE FIELD VALUE mark FROM space.",
  "modify line lineno.",
  "modify line 2.",
  "MODIFY LINE 2 INDEX 0 FIELD VALUE val.",
  "modify line 1 index 0 field value foo bar boo.",
  "modify line 2 of page lv_pagno index sy-lsind field format <lv_format> INVERSE = lv_inverse.",
  "modify line ls_row-linno of page ls_row-pagno index sy-lsind field value gv_mark from lv_selected.",
  "modify line l_index index sy-lsind line format input off.",
  "MODIFY LINE foo-bar INDEX 0 LINE VALUE FROM l_bar.",
  "MODIFY CURRENT LINE FIELD VALUE gv_line FIELD FORMAT lv_format INPUT = lv_input.",
  "MODIFY LINE l_line OF CURRENT PAGE LINE FORMAT INPUT OFF.",
  "MODIFY LINE line FIELD FORMAT new INTENSIFIED ON.",
  "MODIFY CURRENT LINE LINE FORMAT RESET FIELD VALUE txt FROM TEXT-001.",
  "MODIFY LINE line FIELD FORMAT new INTENSIFIED OFF.",
  "MODIFY CURRENT LINE LINE FORMAT RESET COLOR 7.",
  "MODIFY CURRENT LINE LINE FORMAT INTENSIFIED.",
  "MODIFY LINE sy-index FIELD VALUE val FROM var.",
  "MODIFY CURRENT LINE LINE FORMAT INVERSE COLOR 5 FIELD VALUE foo-bar.",
];

statementType(tests, "MODIFY LINE", Statements.ModifyLine);