import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "describe table lt_foo lines lv_lines.",
  "describe distance between <fgs> and <sdf> into l_int in byte mode.",
  "describe field <item> into td.",
  "DESCRIBE FIELD lv_field TYPE lv_type COMPONENTS lv_com OUTPUT-LENGTH " +
    "lv_out DECIMALS lv_dec EDIT MASK lv_mask.",
  "DESCRIBE FIELD ls_data LENGTH lv_max_length_line IN BYTE MODE.",
  "DESCRIBE FIELD lv_foo DECIMALS lv_dec.",
  "describe field lv_foo help-id l_fieldname.",
  "describe field lv_field length len in character mode type itype.",
  "DESCRIBE FIELD cv_data LENGTH lv_length IN CHARACTER MODE.",
  "describe field <item> type typ.",
  "DESCRIBE DISTANCE BETWEEN lv_foo AND lv_bar INTO ld_shift IN CHARACTER MODE.",
  "describe field e_field edit mask l_mask.",
  "describe field <fs> type l_typ components l_num.",
  "describe list number of lines lv_lines.",
  "describe list index sy-index number of lines row.",
  "DESCRIBE FIELD lv_foo LENGTH lv_len.",
  "describe table lt_tab kind lv_kind.",
  "DESCRIBE TABLE lt_foo.",
];

statementType(tests, "DESCRIBE", Statements.Describe);