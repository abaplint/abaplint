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
];

statementType(tests, "WRITE", Statements.Write);