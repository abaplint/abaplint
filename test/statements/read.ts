import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "READ TABLE tt_fields ASSIGNING <ls_fbranch> WITH KEY tabname = 'TEXTL'.",
  "READ TABLE lt_lengths INDEX lines( lt_lengths ) INTO lv_length.",
  "READ TABLE lt_obj FROM lv_super TRANSPORTING NO FIELDS.",
  "READ TABLE gt_stack ASSIGNING <ls_stack> INDEX 1.",
  "READ TABLE mt_map WITH TABLE KEY old = iv_id INTO ls_map.",
  "READ TABLE mt_assets TRANSPORTING NO FIELDS WITH KEY table_line = <ls_asset>-url.",
  "READ TABLE gt_objtype_map INTO ls_objtype_map WITH TABLE KEY obj_typ = is_item-obj_type.",
  "READ TABLE st_syntax ASSIGNING <ls_syntax> WITH KEY rulename = lv_rulename BINARY SEARCH.",
  "READ TABLE mt_stage WITH KEY file-path = iv_path file-filename = iv_filename ASSIGNING <ls_stage>.",
  "READ TABLE lt_foo INTO ls_foo INDEX sy-tfill TRANSPORTING row.",
  "READ TABLE lt_table ASSIGNING <ls_foo> CASTING INDEX lv_index.",
  "READ TABLE rt_data ASSIGNING FIELD-SYMBOL(<ls_data>) WITH KEY test = <ls_result>-test date = lv_date.",
  "READ TABLE it_filter WITH KEY obj_name = sdf TRANSPORTING NO FIELDS.",
  "READ TABLE lt_cross WITH KEY name = lv_name BINARY SEARCH TRANSPORTING NO FIELDS.",
  "READ TABLE lt_data WITH TABLE KEY k_fg COMPONENTS foo = bar TRANSPORTING NO FIELDS.",
  "READ TABLE lo_obj->methods WITH KEY name = ls_meta-meta-handler visibility = cl_abap_objectdescr=>public TRANSPORTING NO FIELDS.",
  "READ TABLE entities REFERENCE INTO node WITH KEY name = iv_name.",
  "READ TABLE lt_table WITH KEY field = lv_value TRANSPORTING NO FIELDS BINARY SEARCH.",
  "READ TABLE lt_data WITH KEY <fs>.",
];

statementType(tests, "READ", Statements.Read);