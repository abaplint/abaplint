import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY (c_tabname) FROM ls_content.",
];

statementType(tests, "MODIFY", Statements.ModifyDatabase);