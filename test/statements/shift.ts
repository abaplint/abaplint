import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SHIFT ls_param-field.",
  "SHIFT lv_range LEFT BY sy-fdpos PLACES.",
  "SHIFT lv_qty RIGHT.",
  "SHIFT lv_syindex RIGHT DELETING TRAILING space.",
];

statementType(tests, "SHIFT", Statements.Shift);