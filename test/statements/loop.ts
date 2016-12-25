import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "loop at foo.",
  "loop at foo into bar.",
  "LOOP AT lt_lines ASSIGNING <ls_line>.",
  "LOOP AT lt_branches FROM 1 ASSIGNING <ls_branch>.",
  "LOOP AT mt_diff TRANSPORTING NO FIELDS.",
  "LOOP AT mt_diff TRANSPORTING NO FIELDS WHERE foo = bar.",
  "LOOP AT it_methods ASSIGNING <ls_method2> FROM lv_index.",
  "LOOP AT it_tokens ASSIGNING <ls_token> FROM sdf TO to.",
  "LOOP AT lt_lines ASSIGNING <ls_line> WHERE moo = boo.",
  "LOOP AT it_order REFERENCE INTO foo.",
  "LOOP AT lt_catalog INTO ls_component USING KEY is_key WHERE is_key = abap_true.",
  "loop at it_foo assigning <bar> casting.",
];

statementType(tests, "LOOP", Statements.Loop);