import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SHIFT ls_param-field.",
  "SHIFT lv_range LEFT BY sy-fdpos PLACES.",
  "SHIFT lv_qty RIGHT.",
//  "SHIFT lv_content BY 1022 PLACES LEFT IN BYTE MODE.",  todo
  "SHIFT l_xstr LEFT DELETING LEADING cl_abap_char_utilities=>byte_order_mark_utf8 IN BYTE MODE.",
  "SHIFT lv_syindex RIGHT DELETING TRAILING space.",
];

statementType(tests, "SHIFT", Statements.Shift);