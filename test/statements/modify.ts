import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY zfoo CLIENT SPECIFIED.",
  "MODIFY (c_tabname) FROM ls_content.",
  "MODIFY zfoo FROM TABLE mt_mat.",
  "MODIFY SCREEN.",
  "modify lt_table index sy-index from item.",
  "MODIFY lt_table INDEX SY-TABIX.",
  "modify lt_table.",
  "MODIFY TABLE mt_map FROM ls_map.",
  "MODIFY lt_table TRANSPORTING field WHERE foo NE foo.",
  "MODIFY lt_table INDEX sy-tabix TRANSPORTING node_id.",
  "MODIFY lt_table FROM ls_data TRANSPORTING field.",
  "modify lt_bar from ls_moo index lv_index transporting field1 field2.",
  "MODIFY lt_table FROM ls_data INDEX SY-TABIX TRANSPORTING field.",
  "modify lt_table from ls_values transporting field where fieldname = 'FOO'.",
  "MODIFY gt_alv FROM ls_alv INDEX ls_rows-index.",
  "MODIFY ct_col INDEX sy-tabix FROM ls_col TRANSPORTING field.",
  "modify ct_data from <ls_data> transporting (name).",
  "MODIFY ct_data TRANSPORTING field.",
  "MODIFY TABLE me->properties FROM prop TRANSPORTING text.",
  "MODIFY ls_foo-interface FROM ls_inter.",
  "MODIFY lt_tab FROM <data> INDEX sy-tabix ASSIGNING <fs>.",
  "MODIFY ct_data FROM <ls_data> TRANSPORTING (b1) (b2).",
  "MODIFY TABLE lt_obj FROM ls_obj TRANSPORTING foo-bar type.",
  "MODIFY (lv_table) CONNECTION (lv_db) FROM TABLE it_data.",
];

statementType(tests, "MODIFY", Statements.Modify);