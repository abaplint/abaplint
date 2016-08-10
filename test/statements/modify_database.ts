import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY (c_tabname) FROM ls_content.",
  "MODIFY zfoo FROM TABLE mt_mat.",
];

statementType(tests, "MODIFY database", Statements.ModifyDatabase);