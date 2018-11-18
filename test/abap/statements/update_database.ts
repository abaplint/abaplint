import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "UPDATE usr02 SET foo = 'bar'.",
  "UPDATE zfoo FROM ls_foo.",
  "UPDATE zfoo.",
  "UPDATE zfoo CLIENT SPECIFIED.",
  "UPDATE zfoo FROM TABLE mt_update.",
  "update zfoo client specified from table lt_table.",
  "UPDATE usr02 SET foo = 'bar' WHERE moo = lv_boo.",
  "UPDATE (c_tabname) SET data_str = iv_data WHERE type = iv_type AND value = iv_value.",
  "UPDATE zfoo CLIENT SPECIFIED SET foo = bar WHERE moo = space.",
  "UPDATE zfoo SET (l_string).",
  "UPDATE zfoo CLIENT SPECIFIED SET foo = bar WHERE moo = SPACE OR boo IS NULL.",
  "UPDATE vekp SET tarag = @lv_tarag, ntvol = @lv_ntvol WHERE venum = @ls_update-venum.",
  "UPDATE table CONNECTION (lv_conn) SET field = value.",
];

statementType(tests, "UPDATE", Statements.UpdateDatabase);