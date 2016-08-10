import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY SCREEN.",
  "modify table index sy-index from item.",
  "MODIFY ct_col INDEX sy-tabix FROM ls_col TRANSPORTING field.",
];

statementType(tests, "MODIFY", Statements.ModifyInternal);