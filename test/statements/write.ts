import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "WRITE 'foobar'.",
  "WRITE / 'hello'.",
  "WRITE lv_row TO lv_char.",
  "write lc_val to lv_time USING EDIT MASK '__:__:__'.",
  "WRITE lv_value TO lv_value_c EXPONENT 0 NO-GROUPING NO-SIGN.",
  "WRITE pv_qty UNIT pv_uom TO lv_text1.",
  "write <item> to lv_value no-grouping no-sign decimals 10.",
  "WRITE AT /10 'sdf'.",
  "WRITE 'Hello' COLOR 6.",
  "write /(100) 'foobar'.",
  "write /(100) 'foobar' color = 4.",
  "write at 52 'sdf' color = 2 inverse.",
  "WRITE AT 10 'sdf'.",
  "WRITE 25 'hello'.",
  "WRITE /.",
  "write l_x right-justified to ls_dump.",
  "WRITE space COLOR lv_col INTENSIFIED OFF.",
  "write lv_val to lv_res currency lv_cur round lv_round no-sign no-zero.",
  "WRITE lv_date DD/MM/YYYY.",
  "WRITE lv_time ENVIRONMENT TIME FORMAT.",
];

statementType(tests, "WRITE", Statements.Write);