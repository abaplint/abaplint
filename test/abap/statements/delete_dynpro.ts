import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DELETE DYNPRO lv_dyn.",
];

statementType(tests, "DELETE DYNPRO", Statements.DeleteDynpro);