import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE FROM (c_tabname) WHERE type = iv_type AND value = iv_value.",
  "DELETE FROM (iv_table_name) WHERE (iv_where_on_keys).",
  "DELETE FROM vclmf WHERE vclname = lv_vclname.",
  "DELETE FROM ZFOOBAR CLIENT SPECIFIED WHERE MANDT = SY-MANDT.",
  "DELETE zfoo FROM TABLE mt_delete.",
];

statementType(tests, "DELETE", Statements.DeleteDatabase);