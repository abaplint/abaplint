import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
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
  "MODIFY lt_tab FROM <data> INDEX sy-tabix ASSIGNING <fs>.",
  "MODIFY ct_data FROM <ls_data> TRANSPORTING (b1) (b2).",
  "MODIFY TABLE lt_obj FROM ls_obj TRANSPORTING foo-bar type.",
  "MODIFY TABLE <ls_transport>-import_info FROM VALUE #( system = <ls_info>-system ).",
  "MODIFY TABLE <ls_transport>-import_info FROM VALUE #( system = <ls_info>-system ) USING KEY unique.",
  "MODIFY <lt_tab> FROM <lt_source>.",
  "MODIFY shlp-fielddescr FROM wa TRANSPORTING mask+4(1) WHERE fieldname = 'FOO'.",
//  "MODIFY sdfsd INDEX sy-tabix USING KEY key FROM ls_sdf TRANSPORTING tra.",
];

statementType(tests, "MODIFY", Statements.ModifyInternal);