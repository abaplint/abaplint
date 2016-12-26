import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "print-control index-line lv_line.",
  "print-control function 'ASDF'.",
];

statementType(tests, "PRINT-CONTROL", Statements.PrintControl);