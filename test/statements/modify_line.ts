import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
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
];

statementType(tests, "MODIFY LINE", Statements.ModifyLine);