import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE FROM (c_tabname) WHERE type = iv_type AND value = iv_value.",
  "DELETE FROM vclmf WHERE vclname = lv_vclname.",
];

statementType(tests, "DELETE", Statements.DeleteDatabase);