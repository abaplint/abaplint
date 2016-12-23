import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE DYNPRO lv_dyn.",
];

statementType(tests, "DELETE DYNPRO", Statements.DeleteDynpro);