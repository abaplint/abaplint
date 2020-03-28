import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SHIFT ls_param-field.",
  "SHIFT lv_range LEFT BY sy-fdpos PLACES.",
  "SHIFT lv_qty RIGHT.",
  "SHIFT lv_bits LEFT CIRCULAR BY iv_places PLACES.",
  "SHIFT lv_content BY 1022 PLACES LEFT IN BYTE MODE.",
  "SHIFT l_xstr LEFT DELETING LEADING cl_abap_char_utilities=>byte_order_mark_utf8 IN BYTE MODE.",
  "SHIFT lv_syindex RIGHT DELETING TRAILING space.",
  "SHIFT lv_cols BY 1 PLACES LEFT.",
  "SHIFT lv_temp UP TO '/' LEFT.",
  "SHIFT classname LEFT UP TO '='.",
  "SHIFT bytes BY places PLACES RIGHT IN BYTE MODE.",
  "SHIFT r_json RIGHT CIRCULAR.",
  "SHIFT lv_field UP TO '-'.",
];

statementType(tests, "SHIFT", Statements.Shift);