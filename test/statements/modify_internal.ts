import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
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
];

statementType(tests, "MODIFY internal", Statements.ModifyInternal);