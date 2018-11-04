import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "READ REPORT ls_include INTO rt_source STATE 'A'.",
  "READ REPORT is_level-name INTO rt_code.",
  "READ REPORT lv_prog STATE lv_version INTO rt_code.",
  "READ REPORT lv_prog STATE 'A' INTO lt_code MAXIMUM WIDTH INTO l_width.",
];

statementType(tests, "READ REPORT", Statements.ReadReport);