import {statementExpectFail, statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DELETE mt_stack INDEX lv_index.",
  "delete ztable from sy-index where bname = <foobar>-bname.",
  "DELETE lt_lengths FROM lv_nlen + 1.",
  "DELETE ADJACENT DUPLICATES FROM rt_tadir COMPARING object obj_name.",
  "DELETE ADJACENT DUPLICATES FROM mt_data USING KEY primary_key.",
  "DELETE lt_local WHERE item = <ls_item>-item.",
  "DELETE ADJACENT DUPLICATES FROM lt_table.",
  "DELETE TABLE mt_list FROM io_repo.",
  "DELETE TABLE lt_not WITH TABLE KEY name = lv_name.",
  "DELETE lt_dists TO lv_nlen.",
  "DELETE ADJACENT DUPLICATES FROM <lt_data> COMPARING (lv_name).",
  "DELETE ADJACENT DUPLICATES FROM <lt_data> COMPARING (foo) (bar).",
  "DELETE ADJACENT DUPLICATES FROM lt_tab COMPARING foo-moo boo-loo.",
  "DELETE lt_data USING KEY key_name WHERE bar = i_bar.",
  "DELETE TABLE lt_tab WITH TABLE KEY key_sort COMPONENTS key = ls_node-key.",
  "DELETE lt_tab INDEX lv_tabix USING KEY ay.",
  "DELETE ct_data USING KEY (mv_key) WHERE (lv_where).",
  "DELETE lt_edges WHERE to-obj_name = <ls_node>-obj_name.",
  "DELETE lt_foo WHERE table_line+30 = 'CCAU'.",
// todo, table key should not use generic Compare
//  "DELETE TABLE <lt_values> WITH TABLE KEY (lv_key) = <lv_key>.",
  "DELETE <fs> WHERE (l_where).",
  `DELETE ADJACENT DUPLICATES FROM li_tab COMPARING field+4(8).`,
  `DELETE ADJACENT DUPLICATES FROM lt_chck USING KEY s00 COMPARING ALL FIELDS.`,
//  `DELETE TABLE <lt_data> WITH TABLE KEY (dynamic) COMPONENTS (dynamic) = lr_key->key.`,
];

statementType(tests, "DELETE", Statements.DeleteInternal);

const fails = [
  "DELETE TABLE mt_edges WHERE from = lv_vertex.",
];
statementExpectFail(fails, "DELETE");