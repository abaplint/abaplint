import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "UPDATE usr02 SET foo = 'bar'.",
  "UPDATE zfoo FROM ls_foo.",
  "UPDATE zfoo.",
  "UPDATE zfoo FROM TABLE mt_update.",
  "UPDATE usr02 SET foo = 'bar' WHERE moo = lv_boo.",
  "UPDATE (c_tabname) SET data_str = iv_data WHERE type = iv_type AND value = iv_value.",
];

statementType(tests, "UPDATE", Statements.UpdateDatabase);