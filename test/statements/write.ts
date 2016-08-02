import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "WRITE 'foobar'.",
  "WRITE / 'hello'.",
  "WRITE lv_row TO lv_char.",
  "write lc_val to lv_time USING EDIT MASK '__:__:__'.",
  "WRITE lv_value TO lv_value_c EXPONENT 0 NO-GROUPING NO-SIGN.",
  "WRITE AT /10 'sdf'.",
  "WRITE AT 10 'sdf'.",
  "WRITE /.",
];

statementType(tests, "WRITE", Statements.Write);