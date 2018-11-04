import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DELETE DYNPRO lv_dyn.",
];

statementType(tests, "DELETE DYNPRO", Statements.DeleteDynpro);