import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "READ TABLE tt_fields ASSIGNING <ls_fbranch> WITH KEY tabname = 'TEXTL'.",
  "READ TABLE lt_lengths INDEX lines( lt_lengths ) INTO lv_length.",
  "READ TABLE lt_obj FROM lv_super TRANSPORTING NO FIELDS.",
  "READ TABLE lt_table WITH KEY foo-bar BINARY SEARCH.",
  "READ TABLE gt_stack ASSIGNING <ls_stack> INDEX 1.",
  "READ TABLE mt_map WITH TABLE KEY old = iv_id INTO ls_map.",
  "READ TABLE mt_assets TRANSPORTING NO FIELDS WITH KEY table_line = <ls_asset>-url.",
  "READ TABLE gt_objtype_map INTO ls_objtype_map WITH TABLE KEY obj_typ = is_item-obj_type.",
  "READ TABLE st_syntax ASSIGNING <ls_syntax> WITH KEY rulename = lv_rulename BINARY SEARCH.",
  "READ TABLE mt_stage WITH KEY file-path = iv_path file-filename = iv_filename ASSIGNING <ls_stage>.",
  "READ TABLE lt_foo INTO ls_foo INDEX sy-tfill TRANSPORTING row.",
  "READ TABLE lt_not_existing WITH KEY agr_name BINARY SEARCH TRANSPORTING NO FIELDS.",
  "READ TABLE lt_table ASSIGNING <ls_foo> CASTING INDEX lv_index.",
  "READ TABLE rt_data ASSIGNING FIELD-SYMBOL(<ls_data>) WITH KEY test = <ls_result>-test date = lv_date.",
  "READ TABLE it_filter WITH KEY obj_name = sdf TRANSPORTING NO FIELDS.",
  "READ TABLE lt_cross WITH KEY name = lv_name BINARY SEARCH TRANSPORTING NO FIELDS.",
  "READ TABLE lt_data WITH TABLE KEY k_fg COMPONENTS foo = bar TRANSPORTING NO FIELDS.",
  "READ TABLE lo_obj->methods WITH KEY name = ls_meta-meta-hand visi = cl_abap=>public TRANSPORTING NO FIELDS.",
  "READ TABLE entities REFERENCE INTO node WITH KEY name = iv_name.",
  "READ TABLE lt_table WITH KEY field = lv_value TRANSPORTING NO FIELDS BINARY SEARCH.",
  "READ TABLE lt_data WITH KEY <fs>.",
  "READ TABLE itab FROM line INTO line COMPARING col2.",
  "READ TABLE lt_tab WITH KEY <ls_foo>-name BINARY SEARCH TRANSPORTING NO FIELDS.",
  "READ TABLE lt_tab WITH KEY = foo-bar.",
  "READ TABLE <tab> WITH KEY (gc_field) = lv_field TRANSPORTING NO FIELDS.",
  "READ TABLE <tab> TRANSPORTING NO FIELDS WITH KEY (lv_key) COMPONENTS (lv_comp) = <lv_field>.",
  "READ TABLE data TRANSPORTING NO FIELDS WITH KEY line(6) = 'foo'.",
  "read table tab assigning <fs> binary search with key node->from = lv_from_.",
  "READ TABLE tab FROM ls_val USING KEY primary_key TRANSPORTING NO FIELDS.",
  "READ TABLE <tab> FROM <line> USING KEY (key) TRANSPORTING NO FIELDS.",
  "READ TABLE tab ASSIGNING <wa> with key path = iv_path.",
  "READ TABLE lt_tab INTO ls_tab INDEX sy-tabix + 1 USING KEY name.",
  "READ TABLE lt_tab INTO ls_tab INDEX lv_tabix COMPARING id.",

  "READ TABLE lt_tab\n" +
  "  WITH KEY field1 = ls_foo-field1\n" +
  "  field2 = ls_foo-field2\n" +
  "  INTO ls_target\n" +
  "  COMPARING foo moo\n" +
  "  TRANSPORTING NO FIELDS.",

  "READ TABLE lt_tab FROM lv_line INTO lv_target COMPARING fields-field.",
  "read table <table> from <from> into <into> transporting (name).",
];

statementType(tests, "READ TABLE", Statements.ReadTable);