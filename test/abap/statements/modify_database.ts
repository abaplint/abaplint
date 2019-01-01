import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements";

const tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY zfoo CLIENT SPECIFIED.",
  "MODIFY (c_tabname) FROM ls_content.",
  "MODIFY zfoo FROM TABLE mt_mat.",
  "MODIFY (lv_table) CONNECTION (lv_db) FROM TABLE it_data.",
  "MODIFY table CONNECTION lv_con FROM TABLE lt_data.",
];

statementType(tests, "MODIFY database", Statements.ModifyDatabase);