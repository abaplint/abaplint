import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH.",
  "GET PROPERTY OF io_app_obj 'Charts' = lv_charts.",
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH EXPORTING foo = bar.",
];

statementType(tests, "GET PROPERTY", Statements.GetProperty);