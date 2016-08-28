import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "IF foo = bar.",
  "IF foo = bar AND moo = boo.",
  "IF lv_column_s CN sy-abcde.",
  "IF ep_style IS REQUESTED.",
  "IF foo NE 0.",
  "IF go_gui IS NOT BOUND.",
  "IF lv_left >= strlen( mv_bits ).",
  "IF li_node IS BOUND.",
  "IF sy-tabix BETWEEN from AND to.",
  "IF iv_str CA '/'.",
  "IF iv_param CS iv_type.",
  "IF NOT it_tpool IS INITIAL.",
  "IF NOT it_tpool[] IS INITIAL.",
  "IF ( sy-subrc = 0 AND lines( it_tpool ) = 1 ) OR lines( it_tpool ) = 0.",
  "IF xstrlen( ls_file-file-data ) = 2.",
  "IF lines( lt_lines ) MOD 2 <> 0.",
  "IF NOT &1 IS INITIAL.",
  "IF foo = bar AND NOT ( foo = bar OR moo = boo ).",
  "IF lv_devclass NOT IN mt_devclass.",
  "IF lv_statement IN mt_range.",
  "IF iv_branch_name IS SUPPLIED.",
  "IF out EQ abap_false.",
  "IF ( lv_offset + 1 ) MOD 8 = 0.",
  "IF is_item-obj_name IS INITIAL.",
  "IF iv_f < - lv_maxint OR iv_f > lv_maxint.",
  "IF foo = bar OR moo = boo.",
];

statementType(tests, "IF", Statements.If);