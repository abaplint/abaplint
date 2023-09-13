import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "OPEN CURSOR WITH HOLD l_db_cursor FOR SELECT mandt objct FROM usr12 WHERE mandt = lv_mandt.",
  "open cursor l_cursor for select * from ztab.",
  "open cursor l_cursor for select * from ztab connection foo.",
  "OPEN CURSOR WITH HOLD mv_cursor FOR SELECT (iv_select) FROM (iv_from) WHERE (iv_where) GROUP BY (iv_group) ORDER BY (iv_order).",
  "OPEN CURSOR WITH HOLD lv_cursor FOR SELECT (lt_fields) FROM (lv_tab) WHERE (lt_where) %_HINTS DB6 'USE_FOO'.",
];

statementType(tests, "OPEN CURSOR", Statements.OpenCursor);