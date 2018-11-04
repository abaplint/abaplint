import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/statements/";
import {Version} from "../../../src/version";

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
  "loop at lt_data into <ls_data> where (condition).",
  "LOOP.",
  "LOOP AT itab INTO wa GROUP BY wa-column.",
  "LOOP AT GROUP group INTO member.",
  "LOOP AT itab INTO DATA(wa) GROUP BY ( sy-tabix - 1 ) DIV n + 1.",
  "LOOP AT <tab> ASSIGNING <data> USING KEY (lv_name) WHERE (lv_where).",
];

statementType(tests, "LOOP", Statements.Loop);

let versions = [
  {abap: "LOOP AT lt_packages ASSIGNING FIELD-SYMBOL(<package>).", ver: Version.v740sp02},
];

statementVersion(versions, "LOOP", Statements.Loop);