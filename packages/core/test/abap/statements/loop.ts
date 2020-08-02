import {statementType, statementVersion, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
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
  "LOOP AT lt_compiler INTO ls_compiler WHERE statement->source_info->name = lv_include.",
  "LOOP AT list INTO DATA(item) GROUP BY item-type INTO DATA(type).",
  "LOOP AT lt_tab INTO DATA(dat) GROUP BY ( model = bar ) ASSIGNING FIELD-SYMBOL(<fs>).",
  "loop at table assigning field-symbol(<fs>) group by field ascending assigning field-symbol(<tar>).",
  "LOOP AT mt_data ASSIGNING <ls_dummy> GROUP BY <ls_dummy>-abc WITHOUT MEMBERS INTO lv_def.",
  "LOOP AT mt_out ASSIGNING FIELD-SYMBOL(<ls_out>) GROUP BY ( d = <ls_out>-d group_size = GROUP SIZE ) REFERENCE INTO DATA(lr_group).",
];

statementType(tests, "LOOP", Statements.Loop);

const versions = [
  {abap: "LOOP AT lt_packages ASSIGNING FIELD-SYMBOL(<package>).", ver: Version.v740sp02},
  {abap: "LOOP AT hierarchy ASSIGNING <h> GROUP BY ( parent = <h>-parent ).", ver: Version.v740sp08},
  {abap: "LOOP AT lo_dot->get_data( )-ignore INTO lv_ignore.", ver: Version.v740sp02},
];

statementVersion(versions, "LOOP", Statements.Loop);

const versionsOk = [
  {abap: "LOOP AT table[] INTO bar.", ver: Version.v702},
];

statementVersionOk(versionsOk, "LOOP, 702", Statements.Loop);