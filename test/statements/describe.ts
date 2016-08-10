import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "describe table lt_foo lines lv_lines.",
  "describe distance between <fgs> and <sdf> into l_int in byte mode.",
  "describe field <item> into td.",
  "DESCRIBE FIELD ls_data LENGTH lv_max_length_line IN BYTE MODE.",
  "DESCRIBE FIELD cv_data LENGTH lv_length IN CHARACTER MODE.",
  "describe field <item> type typ.",
  "describe field <fs> type l_typ components l_num.",
];

statementType(tests, "DESCRIBE", Statements.Describe);