import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "DELETE FROM (c_tabname) WHERE type = iv_type AND value = iv_value.",
  "DELETE FROM (iv_table_name) WHERE (iv_where_on_keys).",
  "DELETE FROM vclmf WHERE vclname = lv_vclname.",
  "DELETE FROM ZFOOBAR CLIENT SPECIFIED WHERE MANDT = SY-MANDT.",
  "DELETE zfoo FROM TABLE mt_delete.",
  "DELETE (c_tabname) FROM <wa>.",
  "delete zfoo client specified from table lt_tab.",
  "DELETE FROM zfoo WHERE timestamp < l_timestampl AND state IN (c_value1, c_value2).",
  "DELETE FROM zfoo WHERE bar LIKE 'FOO'.",
  "delete from zfoo where id is not null.",
  "DELETE FROM /foo/bar CONNECTION (con) WHERE id = lv_id.",
  "delete table connection (lc_db) from table itab.",
];

statementType(tests, "DELETE", Statements.DeleteDatabase);