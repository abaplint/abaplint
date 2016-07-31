import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "describe table lt_foo lines lv_lines.",
  "describe distance between <fgs> and <sdf> into l_int in byte mode.",
  "describe field <item> into td.",
  "describe field <item> type typ.",
  "describe field <fs> type l_typ components l_num.",
];

statementType(tests, "DESCRIBE", Statements.Describe);