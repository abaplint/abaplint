import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "OPEN CURSOR WITH HOLD l_db_cursor FOR SELECT mandt objct FROM usr12 WHERE mandt = lv_mandt.",
  "open cursor l_cursor for select * from ztab.",
  "OPEN CURSOR WITH HOLD mv_cursor FOR SELECT (iv_select) FROM (iv_from) WHERE (iv_where) GROUP BY (iv_group) ORDER BY (iv_order).",
];

statementType(tests, "OPEN CURSOR", Statements.OpenCursor);