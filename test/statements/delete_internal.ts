import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
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
];

statementType(tests, "DELETE", Statements.DeleteInternal);