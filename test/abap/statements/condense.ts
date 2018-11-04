import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "condense lv_foo.",
  "CONDENSE lv_index_str NO-GAPS.",
];

statementType(tests, "CONDENSE", Statements.Condense);