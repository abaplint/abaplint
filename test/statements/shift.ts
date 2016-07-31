import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SHIFT ls_param-field.",
  "SHIFT lv_syindex RIGHT DELETING TRAILING space.",
];

statementType(tests, "SHIFT", Statements.Shift);