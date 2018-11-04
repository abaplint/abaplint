import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CHECK lv_var >< 'ABCD'.",
];

statementType(tests, "CHECK", Statements.Check);