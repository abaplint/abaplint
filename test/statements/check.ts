import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CHECK lv_var >< 'ABCD'.",
];

statementType(tests, "CHECK", Statements.Check);